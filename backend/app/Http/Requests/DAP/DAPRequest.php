<?php

namespace App\Http\Requests\DAP;

use Illuminate\Foundation\Http\FormRequest;

class DAPRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'visite_maritime_id' => ['required', 'exists:visites_maritimes,id', 'unique:daps,visite_maritime_id'],
            'remarques' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'visite_maritime_id.required' => 'L\'escale de rattachement est obligatoire.',
            'visite_maritime_id.exists' => 'L\'escale sélectionnée est introuvable.',
            'visite_maritime_id.unique' => 'Un DAP existe déjà pour cette escale maritime.',
        ];
    }
}
