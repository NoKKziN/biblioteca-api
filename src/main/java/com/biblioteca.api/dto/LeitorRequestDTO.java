package com.biblioteca.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LeitorRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 100)
        String nome,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        @Size(max = 150)
        String email

) {}
