#!/bin/sh
# Aplica schema + seeders em ordem. Uso: ./run.sh [usuario_mysql]
USER="${1:-root}"
DIR="$(dirname "$0")"

mysql -u "$USER" -p < "$DIR/schema.sql"
mysql -u "$USER" -p < "$DIR/seed_usuarios.sql"
mysql -u "$USER" -p < "$DIR/seed_categorias.sql"
mysql -u "$USER" -p < "$DIR/seed_galeria.sql"
