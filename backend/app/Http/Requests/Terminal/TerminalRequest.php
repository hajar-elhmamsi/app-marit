<?php

namespace App\Http\Requests\Terminal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TerminalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $terminalId = $this->route('terminal') ? $this->route('terminal')->id : null;

        return [
            'port_id' => ['required', 'exists:ports,id'],
            'code' => [
                'required',
                'string',
                'max:32',
                Rule::unique('terminals', 'code')->ignore($terminalId),
            ],
            'nom' => ['required', 'string', 'max:191'],
            'type_terminal' => ['required', 'in:conteneurs,vraquier,petrolier,passagers,polyvalent'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'port_id.required' => 'Le port de rattachement est obligatoire.',
            'port_id.exists' => 'Le port sélectionné est introuvable.',
            'code.required' => 'Le code du terminal est obligatoire.',
            'code.unique' => 'Ce code de terminal existe déjà.',
            'nom.required' => 'Le nom du terminal est obligatoire.',
            'type_terminal.required' => 'Le type de terminal est obligatoire.',
        ];
    }
}
