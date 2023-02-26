# Les tests unitaires

J'ai parcouru le code en partant depuis la base et ai ajouté les différents tests selon un ordre d'utilisation.

## Les séparations des différentes sections :

    -Tester les ajouts de voter
    -Vérifier les propositions
    -Vérifier le fonctionnement des votes
    -Vérifier les états
    -Vérifier les événements
    -Les différents tests réussis en image

### Les ajouts de voters :

1. Vérifier que l'owner puisse ajouter un voter
2. S'assurer qu'une autre adresse ne puisse pas ajouter quelqu'un comme voter
3. Ne pas avoir la possibilité d'ajouter deux fois la même personne
4. S'assurer que le owner ne puisse pas ajouter quelqu'un si la phase de propositions a débuté.

### Les propositions :

1. Ne pas pouvoir ajouter une proposition si l'enregistrement des voters n'est pas clôturé
2. Pouvoir ajouter une proposition si nous sommes bien enregistré comme voter
3. Ne pas être capable d'ajouter une proposition vide
4. Pouvoir connaître l'émetteur de la proposition uniquement si on est enregistré comme voter
5. Bloquer la vue des émetteurs de proposition si nous ne sommes pas enregistré comme voter

### Le fonctionnement des votes :

1. Ne pas pouvoir voter tant que la phase de proposition n'est pas terminée
2. Vérifier qu'un voter enregistré puisse voter pour une proposition existante
3. Vérifier qu'on ne puisse voter qu'une seule fois
4. Empêcher de voter les personnes non enregistrées
5. Ne pas pouvoir voter pour une proposition non existante

### Les états :

1. Ne pas pouvoir ajouter de proposition si nous ne sommes pas dans cette phase
2. Pouvoir ajouter une proposition si la phase est ouverte et que nous sommes enregistré
3. Ne pas pouvoir voter si les propositions sont toujours ouvertes
4. Ne pas être capable de voter si les votes ne sont pas ouverts
5. Pouvoir voter si les propositions sont fermées
6. Ne plus être en mesure de voter si la clôture des votes a eu lieu
7. Ne pas pouvoir connaître le gagnant si le owner n'a pas clôturé la session

### Les événements :

1. Vérifier l'émission de l'événement au moment d'ajout d'un voter
2. Vérifier au moment de l'ajout d'une proposition
3. Vérifier qu'à chaque changement de statut l'événement s'effectue bien

### La preuve des tests passés :

![Test_voting](/projet2-test/Img_readme/Test_voting.jpg "Test_voting")
