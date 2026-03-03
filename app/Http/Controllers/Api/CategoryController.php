<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            ['id'=>1,'name'=>'Men','slug'=>'men'],
            ['id'=>2,'name'=>'Women','slug'=>'women'],
            ['id'=>3,'name'=>'Kids','slug'=>'kids'],
        ]);
    }
}
