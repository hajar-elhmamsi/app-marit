<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'agent_maritime', 'capitainerie'])->default('agent_maritime');
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ports', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->string('nom');
            $table->string('pays', 100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('terminals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('port_id')->constrained('ports')->onDelete('restrict');
            $table->string('code', 32)->unique();
            $table->string('nom');
            $table->enum('type_terminal', ['conteneurs', 'vraquier', 'petrolier', 'passagers', 'polyvalent'])->default('conteneurs');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('navires', function (Blueprint $table) {
            $table->id();
            $table->string('imo', 16)->unique();
            $table->string('nom');
            $table->string('pavillon', 100);
            $table->enum('type_navire', ['porte_conteneurs', 'petrolier', 'vraquier', 'gazier', 'roulier', 'remorqueur'])->default('porte_conteneurs');
            $table->decimal('longueur_m', 8, 2);
            $table->decimal('tirant_eau_m', 5, 2);
            $table->unsignedInteger('jauge_brute');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('visites_maritimes', function (Blueprint $table) {
            $table->id();
            $table->string('numero_visite', 64)->unique();
            $table->foreignId('navire_id')->constrained('navires')->onDelete('restrict');
            $table->foreignId('terminal_id')->constrained('terminals')->onDelete('restrict');
            $table->foreignId('agent_id')->constrained('users')->onDelete('restrict');
            $table->dateTime('date_arrivee_estimee');
            $table->dateTime('date_depart_estimee');
            $table->dateTime('date_arrivee_reelle')->nullable();
            $table->dateTime('date_depart_reelle')->nullable();
            $table->enum('statut', ['prevue', 'active', 'cloturee', 'annulee'])->default('prevue');
            $table->text('motif_annulation')->nullable();
            $table->timestamps();
        });

        Schema::create('daps', function (Blueprint $table) {
            $table->id();
            $table->string('numero_dap', 64)->unique();
            $table->foreignId('visite_maritime_id')->unique()->constrained('visites_maritimes')->onDelete('cascade');
            $table->enum('statut', ['brouillon', 'envoye', 'accepte', 'refuse'])->default('brouillon');
            $table->dateTime('date_demande')->useCurrent();
            $table->dateTime('date_traitement')->nullable();
            $table->text('remarques')->nullable();
            $table->text('motif_refus')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action', 64);
            $table->string('entite_type', 64);
            $table->unsignedBigInteger('entite_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['entite_type', 'entite_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('daps');
        Schema::dropIfExists('visites_maritimes');
        Schema::dropIfExists('navires');
        Schema::dropIfExists('terminals');
        Schema::dropIfExists('ports');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('users');
    }
};
