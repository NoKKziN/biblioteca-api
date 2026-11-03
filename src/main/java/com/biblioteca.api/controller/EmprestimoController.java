package com.biblioteca.api.controller;

import com.biblioteca.api.dto.EmprestimoRequestDTO;
import com.biblioteca.api.dto.EmprestimoResponseDTO;
import com.biblioteca.api.service.EmprestimoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    public ResponseEntity<EmprestimoResponseDTO> emprestar(
            @Valid @RequestBody EmprestimoRequestDTO dto) {

        EmprestimoResponseDTO resposta =
                emprestimoService.emprestar(dto);

        URI uri = URI.create("/api/emprestimos/" + resposta.id());

        return ResponseEntity.created(uri).body(resposta);
    }

    @GetMapping
    public ResponseEntity<List<EmprestimoResponseDTO>> listar() {
        return ResponseEntity.ok(emprestimoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmprestimoResponseDTO> buscarPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(emprestimoService.buscarPorId(id));
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<EmprestimoResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(emprestimoService.listarAtivos());
    }

    @GetMapping("/leitor/{leitorId}")
    public ResponseEntity<List<EmprestimoResponseDTO>> listarPorLeitor(
            @PathVariable Long leitorId) {

        return ResponseEntity.ok(
                emprestimoService.listarPorLeitor(leitorId)
        );
    }

    @PutMapping("/{id}/devolucao")
    public ResponseEntity<EmprestimoResponseDTO> devolver(
            @PathVariable Long id) {

        return ResponseEntity.ok(emprestimoService.devolver(id));
    }
}
