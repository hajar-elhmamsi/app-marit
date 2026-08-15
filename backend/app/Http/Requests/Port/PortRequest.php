<?php

namespace App\Http\Requests\Port;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PortRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $portId = $this->route('port') ? $this->route('port')->id : null;

        return [
            'code' => [
                'required',
                'string',
                'max:32',
                Rule::unique('ports', 'code')->ignore($portId),
            ],
            'nom' => ['required', 'string', 'max:191'],
            'pays' => ['required', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Le code portuaire est obligatoire.',
            'code.unique' => 'Ce code de port existe déjà.',
            'nom.required' => 'Le nom du port est obligatoire.',
            'pays.required' => 'Le pays est obligatoire.',
        ];
    }
}
