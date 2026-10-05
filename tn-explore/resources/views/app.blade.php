<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>TN Explore | Tamil Nadu Smart Tourism</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2">
        <link rel="alternate icon" href="/favicon.ico">

        <!-- Scripts & Styles (Air-gapped offline bundled) -->
        @routes
        @viteReactRefresh
        @vite('resources/js/app.jsx')
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
