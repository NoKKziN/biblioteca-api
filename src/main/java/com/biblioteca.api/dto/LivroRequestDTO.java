package com.biblioteca.api.dto;

import jakarta.validation.constraints.*;

public record LivroRequestDTO(

        @NotBlank(message = "O título é obrigatório")
        @Size(max = 150)
        String titulo,

        @NotBlank(message = "O autor é obrigatório")
        @Size(max = 100)
        String autor,

        @NotBlank(message = "O ISBN é obrigatório")
        @Size(max = 20)
        String isbn,

        @NotNull(message = "O ano de publicação é obrigatório")
        @Min(value = 1000)
        @Max(value = 2100)
        Integer anoPublicacao

) {}
