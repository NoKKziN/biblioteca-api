package com.biblioteca.api.controller;

import com.biblioteca.api.dto.LeitorRequestDTO;
import com.biblioteca.api.dto.LeitorResponseDTO;
import com.biblioteca.api.service.LeitorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/leitores")
public class LeitorController {

    private final LeitorService leitorService;

    public LeitorController(LeitorService leitorService) {
        this.leitorService = leitorService;
    }

    @PostMapping
    public ResponseEntity<LeitorResponseDTO> cadastrar(
            @Valid @RequestBody LeitorRequestDTO dto) {

        LeitorResponseDTO resposta = leitorService.cadastrar(dto);

        URI uri = URI.create("/api/leitores/" + resposta.id());

        return ResponseEntity.created(uri).body(resposta);
    }

    @GetMapping
    public ResponseEntity<List<LeitorResponseDTO>> listar() {
        return ResponseEntity.ok(leitorService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeitorResponseDTO> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(leitorService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeitorResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody LeitorRequestDTO dto) {

        return ResponseEntity.ok(leitorService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {

        leitorService.excluir(id);

        return ResponseEntity.noContent().build();
    }
}
