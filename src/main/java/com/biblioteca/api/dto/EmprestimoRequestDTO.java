package com.biblioteca.api.dto;

import jakarta.validation.constraints.NotNull;

public record EmprestimoRequestDTO(

        @NotNull(message = "O ID do livro é obrigatório")
        Long livroId,

        @NotNull(message = "O ID do leitor é obrigatório")
        Long leitorId

) {}
