<?php
/**
 * Corrige los caracteres almacenados incorrectamente como entidades HTML y
 * en latin1. Necesita un fichero llamado users.php en el mismo directorio
 * que tiene el siguiente contenido:
 *
 * <?php
 * $user_list = array(
 * 'mail=mail1@host.tld,ou=People,dc=debatesabiertos,dc=org' => array (
 *   'sn' => 'Nombre incorrecto',
 *   'cn' => 'Unidad T&Atilde;&copy;cnica de Coordinaci&Atilde;&sup3;n',
 *  ),...
 *
 * Este fichero se puede generar con la utilidad de corrección de usuarios
 * para LDAP creada por Sixto.
 *
 * Hay que editar la opción 'dbs' para indicar las bases de datos que queremos
 * actualizar.
 *
 */

require_once('users.php');

$dbs = array(
    /*
    'artwebdesign',
    'askbot',
    'debateabierto',
    'grupodeexpertos',
    'grupoexpertos',
    'resultados',
    'test',
    'testing101',
     */
    'askbot1',
    'askbot2',
    'askbot3',
    );

$fixed = array();

foreach ($user_list as $dn => $data) {
    preg_match('/^mail=(?P<mail>[^,]+),.+$/', $dn, $matches);
    $fixed[$matches['mail']] = array(
        'first_name' => fix($data['cn']),
        'last_name' => fix($data['sn']),
    );
}

function fix($str)
{
    $str = html_entity_decode($str, ENT_QUOTES);
    $str = trim(html_entity_decode($str, ENT_QUOTES));
    return $str;
}

# main
$opciones =  array(
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
        PDO::ATTR_PERSISTENT => true
    );
$sql = 'UPDATE auth_user SET first_name = :first_name, last_name = :last_name, username = :combined WHERE email = :mail';
foreach ($dbs as $db) {
    try {
        $conn = new PDO(
            'mysql:host=localhost;charset=utf8;dbname=' . $db,
            '',
            '',
            $opciones
        );
    } catch (PDOException $e) {
        echo "ERROR al conectar a $db:" . $e->getMessage() . "\n";
        exit;
    }

    foreach ($fixed as $mail => $data) {
        $sth = $conn->prepare($sql);
        $result = $sth->execute(array(
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':combined' => $data['first_name'] . ' ' . $data['last_name'],
            ':mail' => $mail,
        ));
    }
}
