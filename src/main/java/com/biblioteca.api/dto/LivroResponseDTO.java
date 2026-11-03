package com.biblioteca.api.dto;

public record LivroResponseDTO(
        Long id,
        String titulo,
        String autor,
        String isbn,
        Integer anoPublicacao,
        Boolean disponivel
) {}
