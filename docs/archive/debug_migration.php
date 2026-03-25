<?php
// debug_migration.php (V2)
// Script de diagnostic et de réparation pour AGHeal

// Paramètres de connexion MySQL (issus du .env)
$host = '127.0.0.1';
$port = '3306';
$dbname = 'agheal';
$username = 'root';
$password = 'root123';

echo "=== DIAGNOSTIC AGHEAL (V2) ===\n";
echo "Connexion à MySQL $host:$port (base: $dbname)...\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "✅ Connexion réussie !\n\n";

    // 1. Détection des profils orphelins (Cause probable de l'erreur d'inscription)
    echo "--- Détection des profils orphelins ---\n";
    $sql = "SELECT id, email FROM profiles WHERE id NOT IN (SELECT id FROM users)";
    $orphans = $pdo->query($sql)->fetchAll();
    
    if (count($orphans) > 0) {
        echo "⚠️ " . count($orphans) . " profils orphelins détectés (sans utilisateur correspondant) :\n";
        foreach ($orphans as $orphan) {
            echo "   - ID: {$orphan['id']} | Email: {$orphan['email']}\n";
        }
        
        echo "🛠️ Correction : Suppression des profils orphelins...\n";
        $deleted = $pdo->exec("DELETE FROM profiles WHERE id NOT IN (SELECT id FROM users)");
        echo "✅ $deleted profils supprimés. L'inscription devrait maintenant fonctionner !\n";
    } else {
        echo "✅ Aucun profil orphelin détecté.\n";
    }

    // 2. Migration des seeds (Lieux et Types de séances)
    echo "\n--- Vérification des Seeds ---\n";
    
    // Lieux
    $locationsCount = $pdo->query("SELECT COUNT(*) FROM locations")->fetchColumn();
    if ($locationsCount == 0) {
        echo "⚠️ Table 'locations' vide. Insertion des données...\n";
        $sql = "INSERT INTO locations (name, address, notes) VALUES
          ('Parc des Sports', 'Brumath', 'Terrain extérieur'),
          ('Salle AGHeal', '39 rue Balzac, 67170 Brumath', 'Salle couverte'),
          ('Bord du Lac', 'Brumath', 'Parcours nature'),
          ('Studio Adapt''Movement', '6 rue des Champs, 67170 Hochstett', 'Studio équipé'),
          ('Parcours Santé Ville', 'Centre-ville Brumath', 'Parcours aménagé')";
        $pdo->exec($sql);
        echo "✅ Locations insérées.\n";
    } else {
        echo "ℹ️ Table 'locations' contient déjà $locationsCount entrées.\n";
    }

    // Types de séances
    $typesCount = $pdo->query("SELECT COUNT(*) FROM session_types")->fetchColumn();
    if ($typesCount == 0) {
        echo "⚠️ Table 'session_types' vide. Insertion des données...\n";
        $sql = "INSERT INTO session_types (name, description) VALUES
          ('Circuit training', 'Entraînement en circuit avec exercices variés'),
          ('Marche nordique', 'Marche sportive avec bâtons'),
          ('Pilates', 'Renforcement musculaire doux et posture'),
          ('Bilan santé / capacités', 'Évaluation forme physique'),
          ('Coaching remise en forme', 'Accompagnement personnalisé'),
          ('Atelier mobilité', 'Travail de la souplesse et mobilité'),
          ('Renfo doux', 'Renforcement musculaire adapté')";
        $pdo->exec($sql);
        echo "✅ Session types insérés.\n";
    } else {
        echo "ℹ️ Table 'session_types' contient déjà $typesCount entrées.\n";
    }

    // 3. Vérification de l'utilisateur guillaume.trautmann
    echo "\n--- Vérification de l'utilisateur cible ---\n";
    $targetEmail = 'guillaume.trautmann@agheal.fr';
    $user = $pdo->query("SELECT * FROM users WHERE email = '$targetEmail'")->fetch();
    
    if ($user) {
        echo "✅ L'utilisateur '$targetEmail' existe maintenant dans la table 'users' (ID: {$user['id']}).\n";
    } else {
        echo "ℹ️ L'utilisateur '$targetEmail' n'existe PAS encore dans la table 'users'.\n";
        echo "👉 Vous pouvez maintenant tenter l'inscription via l'application.\n";
    }

} catch (PDOException $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
}
