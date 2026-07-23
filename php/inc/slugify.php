<?php
/**
 * Converte um texto em slug: minúsculo, sem acentos, espaços/símbolos viram "-".
 */
function slugify(string $texto): string
{
    $texto = trim($texto);

    if (function_exists('transliterator_transliterate')) {
        $texto = transliterator_transliterate('Any-Latin; Latin-ASCII;', $texto);
    } else {
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto);
    }

    $texto = strtolower($texto);
    $texto = preg_replace('/[^a-z0-9]+/', '-', $texto);
    $texto = trim($texto, '-');

    return $texto === '' ? 'item' : $texto;
}
