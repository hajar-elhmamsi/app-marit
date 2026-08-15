<?php

namespace App\Http\Requests\Navire;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NavireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $navireId = $this->route('navire') ? $this->route('navire')->id : null;

        return [
            'imo' => [
                'required',
                'string',
                'max:16',
                Rule::unique('navires', 'imo')->ignore($navireId),
            ],
            'nom' => ['required', 'string', 'max:191'],
            'pavillon' => ['required', 'string', 'max:100'],
            'type_navire' => ['required', 'in:porte_conteneurs,petrolier,vraquier,gazier,roulier,remorqueur'],
            'longueur_m' => ['required', 'numeric', 'min:1'],
            'tirant_eau_m' => ['required', 'numeric', 'min:0.5'],
            'jauge_brute' => ['required', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'imo.required' => 'Le numéro IMO est obligatoire.',
            'imo.unique' => 'Ce numéro IMO est déjà enregistré pour un autre navire.',
            'nom.required' => 'Le nom du navire est obligatoire.',
            'pavillon.required' => 'Le pavillon (pays) est obligatoire.',
            'type_navire.required' => 'Le type de navire est obligatoire.',
            'longueur_m.required' => 'La longueur hors-tout est obligatoire.',
            'tirant_eau_m.required' => 'Le tirant d\'eau est obligatoire.',
            'jauge_brute.required' => 'La jauge brute (GT) est obligatoire.',
        ];
    }
}
