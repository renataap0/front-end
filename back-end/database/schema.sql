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
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE pilotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    status ENUM('titular', 'reserva', 'em avaliacao') NOT NULL,
    equipe_id INT NOT NULL,
    usuario_id INT NULL UNIQUE,

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
    piloto_id INT NOT NULL UNIQUE,
    equipe_id INT NOT NULL,
    potencia INT NOT NULL,
    aerodinamica INT NOT NULL,
    confiabilidade INT NOT NULL,
    cuidado_pneus INT NOT NULL,
    ers INT NOT NULL,
    velocidade_maxima INT NOT NULL,
    peso INT NOT NULL,
    pacote VARCHAR(255) NOT NULL,

    CONSTRAINT fk_carros_pilotos
        FOREIGN KEY (piloto_id)
        REFERENCES pilotos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_carros_equipes
        FOREIGN KEY (equipe_id)
        REFERENCES equipes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE pistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    tamanho_km DECIMAL(5,3) NOT NULL,
    curvas INT NOT NULL,
    setores INT NOT NULL,
    recorde_ms INT NOT NULL,
    aderencia INT NOT NULL,
    elevacao INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    clima VARCHAR(50) NOT NULL,
    abrasao INT NOT NULL
);

CREATE TABLE corridas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    piloto_id INT NOT NULL,
    equipe_id INT NOT NULL,
    pista_id INT NOT NULL,
    carro_id INT NOT NULL,
    voltas INT NOT NULL,
    melhor_volta_ms INT NOT NULL,
    ultima_volta_ms INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE etapas_temporada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temporada_id INT NOT NULL,
    pista_id INT NOT NULL,
    ordem_indice INT NOT NULL,
    status VARCHAR(50) NOT NULL,

    CONSTRAINT fk_etapas_temporada_temporadas
        FOREIGN KEY (temporada_id)
        REFERENCES temporadas(id)
        ON DELETE CASCADE
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
    tempo_volta_ms INT NOT NULL,
    numero_volta INT NOT NULL,

    CONSTRAINT fk_voltas_etapa_etapas
        FOREIGN KEY (etapa_temporada_id)
        REFERENCES etapas_temporada(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_voltas_etapa_pilotos
        FOREIGN KEY (piloto_id)
        REFERENCES pilotos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_frete DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

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
('admin', 'hash_admin_123456', 'admin'),
('equipe', 'hash_equipe_123456', 'equipe'),
('corredor', 'hash_corredor_123456', 'piloto');

INSERT INTO equipes 
(nome) 
VALUES
('Racing Angels'),
('Orion Apex');

INSERT INTO pilotos 
(nome, status, equipe_id, usuario_id) 
VALUES
('Lia Torres', 'titular', 1, 3),
('Nina Vale', 'titular', 1, NULL),
('Kai Morita', 'reserva', 1, NULL),
('Max Rocha', 'titular', 2, NULL),
('Eva Stone', 'titular', 2, NULL),
('Noah Vega', 'reserva', 2, NULL);

INSERT INTO carros 
(modelo, piloto_id, equipe_id, potencia, aerodinamica, confiabilidade, cuidado_pneus, ers, velocidade_maxima, peso, pacote) 
VALUES
('RA-07 Halo', 1, 1, 930, 88, 91, 86, 89, 335, 798, 'pacote equilibrio'),
('RA-11 Sprint', 2, 1, 945, 82, 88, 79, 91, 342, 795, 'pacote velocidade'),
('RA-X Reserve', 3, 1, 910, 80, 84, 88, 83, 325, 805, 'pacote reserva'),
('OA-01 Apex', 4, 2, 940, 85, 86, 80, 88, 340, 797, 'pacote ataque'),
('OA-02 Vector', 5, 2, 925, 89, 90, 84, 85, 332, 799, 'pacote controle'),
('OA-R Reserve', 6, 2, 905, 78, 82, 87, 81, 322, 808, 'pacote treino');

INSERT INTO pistas 
(nome, pais, cidade, tamanho_km, curvas, setores, recorde_ms, aderencia, elevacao, tipo, clima, abrasao) 
VALUES
('Interlagos', 'Brasil', 'Sao Paulo', 4.309, 15, 3, 70120, 86, 43, 'mista', 'instavel', 72),
('Monaco', 'Monaco', 'Monte Carlo', 3.337, 19, 3, 72190, 78, 42, 'rua', 'seco', 65),
('Spa Francorchamps', 'Belgica', 'Stavelot', 7.004, 20, 3, 101770, 84, 102, 'alta velocidade', 'instavel', 70),
('Suzuka', 'Japao', 'Suzuka', 5.807, 18, 3, 88720, 88, 40, 'tecnica', 'seco', 68),
('Silverstone', 'Reino Unido', 'Silverstone', 5.891, 18, 3, 87100, 87, 11, 'alta velocidade', 'frio', 66),
('Monza', 'Italia', 'Monza', 5.793, 11, 3, 79290, 82, 12, 'velocidade', 'seco', 60),
('Yas Marina', 'Emirados Arabes', 'Abu Dhabi', 5.281, 16, 3, 85050, 81, 10, 'mista', 'noite', 58),
('Marina Bay', 'Singapura', 'Singapura', 4.940, 19, 3, 95300, 76, 5, 'rua', 'umido', 74);

INSERT INTO corridas 
(nome, piloto_id, equipe_id, pista_id, carro_id, voltas, melhor_volta_ms, ultima_volta_ms, status) 
VALUES
('Interlagos GP', 1, 1, 1, 1, 42, 81348, 82005, 'finalizada'),
('Monaco Night Run', 2, 1, 2, 2, 35, 72941, 73850, 'finalizada'),
('Spa Aero Test', 1, 1, 3, 1, 28, 103210, 104020, 'treino'),
('Suzuka Data Cup', 3, 1, 4, 3, 32, 89650, 90440, 'finalizada'),
('Silverstone Sprint', 4, 2, 5, 4, 30, 87128, 87900, 'finalizada'),
('Monza Speed Trial', 5, 2, 6, 5, 36, 80701, 81480, 'finalizada'),
('Yas Marina Final', 2, 1, 7, 2, 44, 85900, 86820, 'manual'),
('Marina Bay Challenge', 6, 2, 8, 6, 29, 96500, 97800, 'treino');

INSERT INTO temporadas 
(versao) 
VALUES
(1);

INSERT INTO etapas_temporada 
(temporada_id, pista_id, ordem_indice, status) 
VALUES
(1, 1, 1, 'finalizada'),
(1, 2, 2, 'finalizada'),
(1, 3, 3, 'finalizada'),
(1, 4, 4, 'finalizada'),
(1, 5, 5, 'finalizada'),
(1, 6, 6, 'finalizada'),
(1, 7, 7, 'pendente'),
(1, 8, 8, 'pendente');

INSERT INTO voltas_etapa 
(etapa_temporada_id, piloto_id, tempo_volta_ms, numero_volta) 
VALUES
(1, 1, 81348, 1),
(1, 1, 81520, 2),
(1, 1, 81790, 3),
(1, 2, 82110, 1),
(1, 2, 81980, 2),
(1, 2, 82330, 3),
(1, 3, 83200, 1),
(1, 3, 82940, 2),
(1, 3, 83110, 3),

(2, 1, 73580, 1),
(2, 1, 73450, 2),
(2, 1, 73720, 3),
(2, 2, 72941, 1),
(2, 2, 73100, 2),
(2, 2, 73320, 3),
(2, 3, 74200, 1),
(2, 3, 74090, 2),
(2, 3, 74500, 3),

(3, 1, 103210, 1),
(3, 1, 103700, 2),
(3, 1, 104020, 3),
(3, 4, 103980, 1),
(3, 4, 104230, 2),
(3, 4, 104500, 3),
(3, 5, 104100, 1),
(3, 5, 103890, 2),
(3, 5, 104300, 3),

(4, 1, 90110, 1),
(4, 1, 89980, 2),
(4, 1, 90240, 3),
(4, 2, 89800, 1),
(4, 2, 89690, 2),
(4, 2, 89920, 3),
(4, 3, 89650, 1),
(4, 3, 89730, 2),
(4, 3, 90440, 3),

(5, 4, 87128, 1),
(5, 4, 87400, 2),
(5, 4, 87900, 3),
(5, 5, 87520, 1),
(5, 5, 87680, 2),
(5, 5, 88030, 3),

(6, 4, 81220, 1),
(6, 4, 81050, 2),
(6, 4, 81600, 3),
(6, 5, 80701, 1),
(6, 5, 81120, 2),
(6, 5, 81480, 3);

INSERT INTO produtos 
(nome, preco) 
VALUES
('Camisa Team Carbon', 149.90),
('Bone Racing Angels', 89.90),
('Jaqueta Speed Black', 329.90),
('Adesivo Pista Pro', 24.90),
('Miniatura RA-07 Halo', 199.90),
('Luva Piloto Pro', 259.90),
('Caneca Racing Angels', 49.90),
('Poster Grid Collection', 39.90);

INSERT INTO pedidos 
(usuario_id, valor_total, valor_frete) 
VALUES
(1, 239.80, 39.90),
(3, 659.80, 0.00);

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
    c.voltas,
    c.melhor_volta_ms,
    c.ultima_volta_ms,
    c.status,
    c.criado_em
FROM corridas c
INNER JOIN pilotos p ON c.piloto_id = p.id
INNER JOIN equipes e ON c.equipe_id = e.id
INNER JOIN pistas pi ON c.pista_id = pi.id
INNER JOIN carros ca ON c.carro_id = ca.id;

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
    pi.aderencia,
    pi.abrasao,
    COUNT(c.id) AS total_corridas,
    ROUND(AVG(c.melhor_volta_ms), 0) AS media_melhor_volta_ms,
    GREATEST(
        1,
        LEAST(
            100,
            ROUND(
                132
                - ((AVG(c.melhor_volta_ms) / 1000 / pi.tamanho_km) * 3)
                + (pi.aderencia * 0.13)
                - (pi.abrasao * 0.05)
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
    pi.aderencia,
    pi.abrasao;
