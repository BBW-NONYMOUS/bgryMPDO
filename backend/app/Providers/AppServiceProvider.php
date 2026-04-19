<?php

namespace App\Providers;

use App\Models\Barangay;
use App\Models\Category;
use App\Models\Document;
use App\Models\User;
use App\Observers\BarangayObserver;
use App\Observers\CategoryObserver;
use App\Observers\DocumentObserver;
use App\Observers\UserObserver;
use App\Policies\DocumentPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Document::class, DocumentPolicy::class);

        User::observe(UserObserver::class);
        Category::observe(CategoryObserver::class);
        Barangay::observe(BarangayObserver::class);
        Document::observe(DocumentObserver::class);
    }
}
