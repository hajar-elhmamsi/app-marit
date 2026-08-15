<?php

namespace App\Http\Requests\Visite;

use Illuminate\Foundation\Http\FormRequest;

class VisiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'navire_id' => ['required', 'exists:navires,id'],
            'terminal_id' => ['required', 'exists:terminals,id'],
            'date_arrivee_estimee' => ['required', 'date'],
            'date_depart_estimee' => ['required', 'date', 'after:date_arrivee_estimee'],
            'numero_visite' => ['sometimes', 'string', 'max:64', 'unique:visites_maritimes,numero_visite'],
        ];
    }

    public function messages(): array
    {
        return [
            'navire_id.required' => 'Le navire est obligatoire.',
            'navire_id.exists' => 'Le navire sélectionné est introuvable.',
            'terminal_id.required' => 'Le terminal d\'accostage est obligatoire.',
            'terminal_id.exists' => 'Le terminal sélectionné est introuvable.',
            'date_arrivee_estimee.required' => 'La date et heure d\'arrivée estimée (ETA) sont obligatoires.',
            'date_depart_estimee.required' => 'La date et heure de départ estimée (ETD) sont obligatoires.',
            'date_depart_estimee.after' => 'La date de départ doit être postérieure à la date d\'arrivée.',
        ];
    }
}
