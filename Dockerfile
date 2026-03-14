# Laravel on Railway: use Docker instead of Nixpacks (avoids "Error creating build plan")
FROM php:8.2-cli-alpine

# Install system deps + PHP extensions Laravel needs
RUN apk add --no-cache \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    icu-dev \
    oniguruma-dev \
    mysql-client \
    && docker-php-ext-configure pdo_mysql \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        zip \
        intl \
        bcmath \
        opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

# Copy app (respects .dockerignore / .railwayignore)
COPY . .

# Install PHP deps (no dev for production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Railway sets PORT at runtime
EXPOSE 8000

# Run migrations + seed (roles + demo users), then serve
CMD sh -c 'php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}'
