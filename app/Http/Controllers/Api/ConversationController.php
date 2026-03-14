<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    /**
     * Total unread message count for the current user (for notification badge).
     */
    public function unreadCount(Request $request)
    {
        $userId = $request->user()->id;
        $count = Message::whereNull('read_at')
            ->where('user_id', '!=', $userId)
            ->whereHas('conversation', function ($q) use ($userId) {
                $q->where('seller_id', $userId)->orWhere('customer_id', $userId);
            })
            ->count();

        return response()->json(['unread_count' => $count], 200);
    }

    /**
     * List conversations for the current user (as seller or customer).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $conversations = Conversation::where('seller_id', $user->id)
            ->orWhere('customer_id', $user->id)
            ->with(['seller:id,name,email', 'customer:id,name,email', 'product:id,name,slug,image'])
            ->withCount(['messages' => function ($q) use ($user) {
                $q->where('user_id', '!=', $user->id)->whereNull('read_at');
            }])
            ->orderByDesc('updated_at')
            ->get();

        $list = $conversations->map(function ($c) use ($user) {
            $other = $c->seller_id === $user->id ? $c->customer : $c->seller;
            $lastMessage = $c->messages()->latest()->first();
            return [
                'id' => $c->id,
                'other_user' => $other ? ['id' => $other->id, 'name' => $other->name, 'email' => $other->email] : null,
                'product' => $c->product,
                'unread_count' => $c->messages_count ?? 0,
                'last_message' => $lastMessage ? [
                    'body' => \Str::limit($lastMessage->body, 50),
                    'created_at' => $lastMessage->created_at->toIso8601String(),
                    'is_mine' => $lastMessage->user_id === $user->id,
                ] : null,
                'updated_at' => $c->updated_at->toIso8601String(),
            ];
        });

        return response()->json(['conversations' => $list], 200);
    }

    /**
     * Get a single conversation with messages.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $conversation = Conversation::with(['seller:id,name,email', 'customer:id,name,email', 'product:id,name,slug,image'])
            ->where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('seller_id', $user->id)->orWhere('customer_id', $user->id);
            })
            ->firstOrFail();

        $messages = $conversation->messages()->with('user:id,name')->get();

        // Mark messages from the other user as read
        $conversation->messages()
            ->where('user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $other = $conversation->seller_id === $user->id ? $conversation->customer : $conversation->seller;

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'other_user' => $other ? ['id' => $other->id, 'name' => $other->name, 'email' => $other->email] : null,
                'product' => $conversation->product,
            ],
            'messages' => $messages,
        ], 200);
    }

    /**
     * Create or get existing conversation with another user.
     * Body: other_user_id (required), product_id (optional).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'other_user_id' => 'required|exists:users,id',
            'product_id' => 'nullable|exists:products,id',
        ]);

        $user = $request->user();
        $other = User::findOrFail($validated['other_user_id']);

        if ($other->id === $user->id) {
            return response()->json(['message' => 'Cannot start conversation with yourself'], 422);
        }

        $sellerId = null;
        $customerId = null;
        if ($user->hasRole('seller') && $other->hasRole('customer')) {
            $sellerId = $user->id;
            $customerId = $other->id;
        } elseif ($user->hasRole('customer') && $other->hasRole('seller')) {
            $sellerId = $other->id;
            $customerId = $user->id;
        } else {
            return response()->json(['message' => 'Conversation must be between a seller and a customer'], 422);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'seller_id' => $sellerId,
                'customer_id' => $customerId,
            ],
            ['product_id' => $validated['product_id'] ?? null]
        );

        if ($conversation->wasRecentlyCreated && !empty($validated['product_id'])) {
            $conversation->update(['product_id' => $validated['product_id']]);
        }

        $conversation->load(['seller:id,name,email', 'customer:id,name,email', 'product:id,name,slug,image']);
        $otherUser = $conversation->seller_id === $user->id ? $conversation->customer : $conversation->seller;

        return response()->json([
            'message' => 'Conversation ready',
            'conversation' => [
                'id' => $conversation->id,
                'other_user' => $otherUser ? ['id' => $otherUser->id, 'name' => $otherUser->name, 'email' => $otherUser->email] : null,
                'product' => $conversation->product,
            ],
        ], 201);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, $id)
    {
        $request->validate(['body' => 'required|string|max:2000']);

        $user = $request->user();
        $conversation = Conversation::where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('seller_id', $user->id)->orWhere('customer_id', $user->id);
            })
            ->firstOrFail();

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => $request->body,
        ]);

        $message->load('user:id,name');

        return response()->json(['message' => $message], 201);
    }
}
