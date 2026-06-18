CREATE DATABASE IF NOT EXISTS corridapro
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE corridapro;

SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS vw_eficiencia_pistas;
DROP VIEW IF EXISTS vw_estatisticas_pilotos;
DROP VIEW IF EXISTS vw_score_carros;
DROP VIEW IF EXISTS vw_corridas_completas;

DROP TABLE IF EXISTS itens_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS voltas_etapa;
DROP TABLE IF EXISTS etapas_temporada;
DROP TABLE IF EXISTS temporadas;
DROP TABLE IF EXISTS corridas;
DROP TABLE IF EXISTS pistas;
DROP TABLE IF EXISTS carros;
DROP TABLE IF EXISTS pilotos;
DROP TABLE IF EXISTS equipes;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('piloto', 'equipe', 'admin') NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE equipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    pais VARCHAR(100) NULL,
    chefe VARCHAR(255) NULL,
    ano_fundacao SMALLINT UNSIGNED NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE pilotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    nacionalidade VARCHAR(100) NULL,
    status ENUM('titular', 'reserva', 'em avaliacao') NOT NULL,
    numero INT UNSIGNED NULL,
    equipe_id INT NOT NULL,
    usuario_id INT NULL UNIQUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pilotos_equipes
        FOREIGN KEY (equipe_id)
        REFERENCES equipes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_pilotos_usuarios
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE carros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modelo VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NULL,
    piloto_id INT NULL UNIQUE,
    equipe_id INT NOT NULL,
    potencia INT NOT NULL,
    aerodinamica INT NOT NULL,
    confiabilidade INT NOT NULL,
    cuidado_pneus INT NOT NULL,
    ers INT NOT NULL,
    velocidade_maxima INT NOT NULL,
    peso INT NOT NULL,
    pacote VARCHAR(255) NOT NULL DEFAULT 'Pacote tecnico',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carros_pilotos
        FOREIGN KEY (piloto_id)
        REFERENCES pilotos(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_carros_equipes
        FOREIGN KEY (equipe_id)
        REFERENCES equipes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE pistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    pais VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    tamanho_km DECIMAL(5,3) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    curvas INT UNSIGNED NOT NULL DEFAULT 0,
    setores INT UNSIGNED NOT NULL DEFAULT 3,
    recorde_volta_ms INT UNSIGNED NULL,
    aderencia TINYINT UNSIGNED NOT NULL DEFAULT 80,
    elevacao INT UNSIGNED NOT NULL DEFAULT 0,
    clima VARCHAR(100) NULL DEFAULT 'Variavel',
    abrasao TINYINT UNSIGNED NOT NULL DEFAULT 50,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_pistas_aderencia CHECK (aderencia BETWEEN 0 AND 100),
    CONSTRAINT chk_pistas_abrasao CHECK (abrasao BETWEEN 0 AND 100)
);

CREATE TABLE corridas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    duracao_ms INT UNSIGNED NOT NULL DEFAULT 5400000,
    piloto_id INT NOT NULL,
    equipe_id INT NOT NULL,
    pista_id INT NOT NULL,
    carro_id INT NULL,
    voltas INT NOT NULL,
    melhor_volta_ms INT NOT NULL,
    ultima_volta_ms INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    data_corrida DATETIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_corridas_pilotos
        FOREIGN KEY (piloto_id)
        REFERENCES pilotos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_corridas_equipes
        FOREIGN KEY (equipe_id)
        REFERENCES equipes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_corridas_pistas
        FOREIGN KEY (pista_id)
        REFERENCES pistas(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_corridas_carros
        FOREIGN KEY (carro_id)
        REFERENCES carros(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE temporadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    versao INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ano SMALLINT UNSIGNED NOT NULL,
    status VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE etapas_temporada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temporada_id INT NOT NULL,
    corrida_id INT NULL,
    pista_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ordem_indice INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    agendada_em DATETIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_etapas_temporada_temporadas
        FOREIGN KEY (temporada_id)
        REFERENCES temporadas(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_etapas_temporada_corridas
        FOREIGN KEY (corrida_id)
        REFERENCES corridas(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_etapas_temporada_pistas
        FOREIGN KEY (pista_id)
        REFERENCES pistas(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE voltas_etapa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etapa_temporada_id INT NOT NULL,
    piloto_id INT NOT NULL,
    carro_id INT NULL,
    tempo_volta_ms INT NOT NULL,
    numero_volta INT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_voltas_etapa_etapas
        FOREIGN KEY (etapa_temporada_id)
        REFERENCES etapas_temporada(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_voltas_etapa_pilotos
        FOREIGN KEY (piloto_id)
        REFERENCES pilotos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_voltas_etapa_carros
        FOREIGN KEY (carro_id)
        REFERENCES carros(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT UNSIGNED NOT NULL DEFAULT 0,
    imagem_url VARCHAR(2048) NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(32) NOT NULL UNIQUE,
    usuario_id INT NOT NULL,
    nome_cliente VARCHAR(255) NOT NULL,
    email_cliente VARCHAR(255) NOT NULL,
    cep_cliente VARCHAR(20) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL,
    valor_subtotal DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_frete DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'aprovado',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pedidos_usuarios
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_itens_pedido_pedidos
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_itens_pedido_produtos
        FOREIGN KEY (produto_id)
        REFERENCES produtos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

INSERT INTO usuarios 
(nome_usuario, senha_hash, perfil) 
VALUES
('admin', '$2b$10$AW7H6V6lUV9Eh5kjGkCdQuW4UCeB7E0yxinEqOAhnl5JGesEwATHy', 'admin'),
('equipe', '$2b$10$AW7H6V6lUV9Eh5kjGkCdQuW4UCeB7E0yxinEqOAhnl5JGesEwATHy', 'equipe'),
('corredor', '$2b$10$AW7H6V6lUV9Eh5kjGkCdQuW4UCeB7E0yxinEqOAhnl5JGesEwATHy', 'piloto');

INSERT INTO equipes
(nome, pais, chefe, ano_fundacao)
VALUES
('Racing Angels', 'Brasil', 'Renata Queiroz', 2018),
('Apex Storms', 'Portugal', NULL, 2019),
('Lightning', 'Japao', NULL, 2017),
('Sakura Racing', 'Brasil', NULL, 2020),
('Kerberus', 'Italia', NULL, 2016),
('Septem', 'Reino Unido', NULL, 2015),
('Cowabunga', 'Estados Unidos', NULL, 2021),
('Wind Speed', 'Emirados Arabes', NULL, 2022);

INSERT INTO pilotos
(nome, nacionalidade, status, numero, equipe_id, usuario_id)
VALUES
('Raphael Galhardo', 'Brasileira', 'titular', 7, 1, 3),
('Renata Queiroz', 'Brasileira', 'titular', 11, 1, NULL),
('Rafaela Santana', 'Brasileira', 'reserva', 21, 1, NULL),
('Gabriela Basilio', 'Brasileira', 'reserva', 44, 1, NULL);

INSERT INTO carros
(modelo, codigo, piloto_id, equipe_id, potencia, aerodinamica, confiabilidade, cuidado_pneus, ers, velocidade_maxima, peso, pacote)
VALUES
('RA-07 Halo', 'RA-07', 1, 1, 930, 88, 91, 86, 89, 335, 798, 'pacote equilibrio'),
('RA-11 Sprint', 'RA-11', 2, 1, 945, 82, 88, 79, 91, 342, 795, 'pacote velocidade'),
('RA-21 Reserve', 'RA-21', 3, 1, 910, 80, 84, 88, 83, 325, 805, 'pacote reserva'),
('RA-44 Reserve', 'RA-44', 4, 1, 905, 78, 82, 87, 81, 322, 808, 'pacote treino');

INSERT INTO pistas
(nome, pais, cidade, tamanho_km, tipo, curvas, setores, recorde_volta_ms, aderencia, elevacao, clima, abrasao)
VALUES
('Racing Angels', 'Brasil', 'Sao Paulo', 4.309, 'mista', 15, 3, 81348, 84, 43, 'Variavel', 52),
('Apex Storms', 'Portugal', 'Lisboa', 4.120, 'tecnica', 14, 3, 72941, 82, 36, 'Seco', 48),
('Apex Racing', 'Japao', 'Suzuka', 5.807, 'tecnica', 18, 3, 90210, 88, 40, 'Variavel', 58),
('Sakura Racing', 'Brasil', 'Curitiba', 3.695, 'mista', 12, 3, 89650, 80, 25, 'Chuvoso', 45),
('Kerberus', 'Italia', 'Monza', 5.793, 'velocidade', 11, 3, 87128, 86, 12, 'Seco', 40),
('Septem', 'Reino Unido', 'Silverstone', 5.891, 'alta velocidade', 18, 3, 80701, 87, 18, 'Variavel', 55),
('Cowabunga', 'Estados Unidos', 'Austin', 5.513, 'mista', 20, 3, 85900, 83, 41, 'Quente', 62),
('Wind Speed', 'Emirados Arabes', 'Abu Dhabi', 5.281, 'noturna', 16, 3, 96500, 85, 21, 'Seco', 47);

INSERT INTO corridas
(nome, piloto_id, equipe_id, pista_id, carro_id, voltas, melhor_volta_ms, ultima_volta_ms, status, data_corrida)
VALUES
('Racing Angels GP', 1, 1, 1, 1, 42, 81348, 82005, 'finalizada', '2026-03-08 14:00:00'),
('Apex Storms GP', 2, 1, 2, 2, 35, 82941, 83850, 'finalizada', '2026-03-22 14:00:00'),
('Apex Racing GP', 1, 1, 3, 1, 28, 90210, 91020, 'treino', '2026-04-05 14:00:00'),
('Sakura Racing GP', 3, 1, 4, 3, 32, 89650, 90440, 'finalizada', '2026-04-19 14:00:00'),
('Kerberus GP', 4, 1, 5, 4, 30, 87128, 87900, 'finalizada', '2026-05-03 14:00:00'),
('Septem GP', 2, 1, 6, 2, 36, 88701, 89480, 'finalizada', '2026-05-17 14:00:00'),
('Cowabunga GP', 3, 1, 7, 3, 44, 85900, 86820, 'manual', '2026-06-07 14:00:00'),
('Wind Speed GP', 4, 1, 8, 4, 29, 96500, 97800, 'treino', '2026-06-21 14:00:00');

INSERT INTO temporadas
(versao, nome, ano, status)
VALUES
(1, 'Temporada Racing Angels 2026', 2026, 'Ativa');

INSERT INTO etapas_temporada
(temporada_id, corrida_id, pista_id, nome, ordem_indice, status, agendada_em)
VALUES
(1, 1, 1, 'Racing Angels GP', 1, 'finalizada', '2026-03-08 14:00:00'),
(1, 2, 2, 'Apex Storms GP', 2, 'finalizada', '2026-03-22 14:00:00'),
(1, 3, 3, 'Apex Racing GP', 3, 'finalizada', '2026-04-05 14:00:00'),
(1, 4, 4, 'Sakura Racing GP', 4, 'finalizada', '2026-04-19 14:00:00'),
(1, 5, 5, 'Kerberus GP', 5, 'finalizada', '2026-05-03 14:00:00'),
(1, 6, 6, 'Septem GP', 6, 'finalizada', '2026-05-17 14:00:00'),
(1, 7, 7, 'Cowabunga GP', 7, 'pendente', '2026-06-07 14:00:00'),
(1, 8, 8, 'Wind Speed GP', 8, 'pendente', '2026-06-21 14:00:00');

INSERT INTO voltas_etapa
(etapa_temporada_id, piloto_id, carro_id, tempo_volta_ms, numero_volta)
VALUES
(1, 1, 1, 81348, 1),
(1, 1, 1, 81520, 2),
(1, 1, 1, 81790, 3),
(1, 2, 2, 82110, 1),
(1, 2, 2, 81980, 2),
(1, 2, 2, 82330, 3),
(1, 3, 3, 83200, 1),
(1, 3, 3, 82940, 2),
(1, 3, 3, 83110, 3),

(2, 1, 1, 73580, 1),
(2, 1, 1, 73450, 2),
(2, 1, 1, 73720, 3),
(2, 2, 2, 72941, 1),
(2, 2, 2, 73100, 2),
(2, 2, 2, 73320, 3),
(2, 3, 3, 74200, 1),
(2, 3, 3, 74090, 2),
(2, 3, 3, 74500, 3),

(3, 1, 1, 103210, 1),
(3, 1, 1, 103700, 2),
(3, 1, 1, 104020, 3),
(3, 4, 4, 103980, 1),
(3, 4, 4, 104230, 2),
(3, 4, 4, 104500, 3),
(3, 2, 2, 104100, 1),
(3, 2, 2, 103890, 2),
(3, 2, 2, 104300, 3),

(4, 1, 1, 90110, 1),
(4, 1, 1, 89980, 2),
(4, 1, 1, 90240, 3),
(4, 2, 2, 89800, 1),
(4, 2, 2, 89690, 2),
(4, 2, 2, 89920, 3),
(4, 3, 3, 89650, 1),
(4, 3, 3, 89730, 2),
(4, 3, 3, 90440, 3),

(5, 4, 4, 87128, 1),
(5, 4, 4, 87400, 2),
(5, 4, 4, 87900, 3),
(5, 2, 2, 87520, 1),
(5, 2, 2, 87680, 2),
(5, 2, 2, 88030, 3),

(6, 4, 4, 81220, 1),
(6, 4, 4, 81050, 2),
(6, 4, 4, 81600, 3),
(6, 3, 3, 80701, 1),
(6, 3, 3, 81120, 2),
(6, 3, 3, 81480, 3);

INSERT INTO produtos
(nome, descricao, preco, estoque, imagem_url, ativo)
VALUES
('Camisa Team Carbon', 'Camisa oficial da equipe Racing Angels.', 149.90, 50, '../assets/shop/image (3).png', TRUE),
('Bone Racing Angels', 'Bone oficial com acabamento premium.', 89.90, 60, '../assets/shop/image (4).png', TRUE),
('Jaqueta Speed Black', 'Jaqueta tecnica inspirada no pit lane.', 329.90, 30, '../assets/shop/image (5).png', TRUE),
('Adesivo Pista Pro', 'Adesivo resistente para uso externo.', 24.90, 200, NULL, TRUE),
('Miniatura RA-07 Halo', 'Miniatura colecionavel do RA-07 Halo.', 199.90, 40, '../assets/shop/image (2).png', TRUE),
('Luva Piloto Pro', 'Luva esportiva Racing Angels.', 259.90, 25, NULL, TRUE),
('Caneca Racing Angels', 'Caneca oficial da equipe.', 49.90, 100, NULL, TRUE),
('Poster Grid Collection', 'Poster da colecao de grid.', 39.90, 120, NULL, TRUE);

INSERT INTO pedidos
(codigo, usuario_id, nome_cliente, email_cliente, cep_cliente, metodo_pagamento, valor_subtotal, valor_frete, valor_total, status)
VALUES
('RA-000001', 1, 'Administrador', 'admin@racingangels.local', '01001000', 'pix', 239.80, 24.90, 264.70, 'aprovado'),
('RA-000002', 3, 'Raphael Galhardo', 'raphael@racingangels.local', '01310930', 'card', 659.80, 0.00, 659.80, 'aprovado');

INSERT INTO itens_pedido 
(pedido_id, produto_id, quantidade, preco_unitario) 
VALUES
(1, 1, 1, 149.90),
(1, 2, 1, 89.90),
(2, 3, 2, 329.90);

CREATE VIEW vw_corridas_completas AS
SELECT
    c.id,
    c.nome AS corrida,
    p.nome AS piloto,
    e.nome AS equipe,
    pi.nome AS pista,
    ca.modelo AS carro,
    c.duracao_ms,
    c.voltas,
    c.melhor_volta_ms,
    c.ultima_volta_ms,
    c.status,
    c.criado_em
FROM corridas c
INNER JOIN pilotos p ON c.piloto_id = p.id
INNER JOIN equipes e ON c.equipe_id = e.id
INNER JOIN pistas pi ON c.pista_id = pi.id
LEFT JOIN carros ca ON c.carro_id = ca.id;

CREATE VIEW vw_score_carros AS
SELECT
    ca.id,
    ca.modelo,
    e.nome AS equipe,
    p.nome AS piloto,
    ca.potencia,
    ca.aerodinamica,
    ca.confiabilidade,
    ca.cuidado_pneus,
    ca.ers,
    ca.velocidade_maxima,
    ca.peso,
    ca.pacote,
    GREATEST(
        1,
        LEAST(
            100,
            ROUND(
                35
                + ((ca.potencia - 900) * 0.11)
                + (ca.aerodinamica * 0.22)
                + (ca.confiabilidade * 0.20)
                + (ca.cuidado_pneus * 0.16)
                + (ca.ers * 0.14)
                + ((ca.velocidade_maxima - 300) * 0.08)
                - ((ca.peso - 790) * 0.05)
            )
        )
    ) AS score
FROM carros ca
INNER JOIN equipes e ON ca.equipe_id = e.id
INNER JOIN pilotos p ON ca.piloto_id = p.id;

CREATE VIEW vw_estatisticas_pilotos AS
SELECT
    p.id,
    p.nome AS piloto,
    e.nome AS equipe,
    COUNT(c.id) AS total_corridas,
    SUM(c.voltas) AS total_voltas,
    MIN(c.melhor_volta_ms) AS melhor_volta_ms,
    ROUND(AVG(c.melhor_volta_ms), 0) AS media_melhor_volta_ms,
    ROUND(AVG(ABS(c.ultima_volta_ms - c.melhor_volta_ms)), 0) AS consistencia_ms
FROM pilotos p
INNER JOIN equipes e ON p.equipe_id = e.id
LEFT JOIN corridas c ON c.piloto_id = p.id
GROUP BY p.id, p.nome, e.nome;

CREATE VIEW vw_eficiencia_pistas AS
SELECT
    pi.id,
    pi.nome AS pista,
    pi.pais,
    pi.cidade,
    pi.tamanho_km,
    pi.tipo,
    COUNT(c.id) AS total_corridas,
    ROUND(AVG(c.melhor_volta_ms), 0) AS media_melhor_volta_ms,
    GREATEST(
        1,
        LEAST(
            100,
            ROUND(
                100
                - ((COALESCE(AVG(c.melhor_volta_ms), 90000) / 1000 / pi.tamanho_km) * 2)
            )
        )
    ) AS eficiencia
FROM pistas pi
LEFT JOIN corridas c ON c.pista_id = pi.id
GROUP BY
    pi.id,
    pi.nome,
    pi.pais,
    pi.cidade,
    pi.tamanho_km,
    pi.tipo;
