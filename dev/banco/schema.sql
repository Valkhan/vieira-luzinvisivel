-- Banco de dados — a luz invisível
-- Convenção: todas as tabelas possuem id, sys_cri, sys_alt e sys_del (soft delete).

CREATE DATABASE IF NOT EXISTS luzinvisivel
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE luzinvisivel;

-- ─── usuarios ─── administradores do /gerenciador/
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  sys_cri DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sys_alt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  sys_del DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

-- ─── categorias ─── seções do menu "Categorias"
CREATE TABLE categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  ordem INT UNSIGNED NOT NULL DEFAULT 0,
  sys_cri DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sys_alt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  sys_del DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_categorias_slug (slug)
) ENGINE=InnoDB;

-- ─── galeria ─── itens de portfólio, vinculados a uma categoria
CREATE TABLE galeria (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NULL,
  imagem VARCHAR(255) NOT NULL,
  destaque TINYINT(1) NOT NULL DEFAULT 0,
  ordem INT UNSIGNED NOT NULL DEFAULT 0,
  sys_cri DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sys_alt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  sys_del DATETIME NULL DEFAULT NULL,
  CONSTRAINT fk_galeria_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias (id)
) ENGINE=InnoDB;

-- ─── contatos ─── mensagens recebidas pelo formulário "Manda um alô"
CREATE TABLE contatos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  mensagem TEXT NOT NULL,
  lido TINYINT(1) NOT NULL DEFAULT 0,
  sys_cri DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sys_alt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  sys_del DATETIME NULL DEFAULT NULL
) ENGINE=InnoDB;
