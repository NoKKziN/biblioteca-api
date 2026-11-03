package com.biblioteca.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI bibliotecaOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("Biblioteca API")
                        .version("1.0.0")
                        .description(
                                "API REST para gerenciamento de livros, " +
                                "leitores, empréstimos e devoluções."
                        )
                );
    }
}
