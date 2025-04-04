document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('content-form');
    const responseMessage = document.getElementById('response-message');
    const webhookUrl = 'https://hook.eu2.make.com/fijk5sq6bdtf98cmqljh4nij1a722km7';
    
    // Compteur de caractères - version simplifiée
    const textarea = document.getElementById('subject');
    const counter = document.getElementById('char-count');
    const charCounter = document.querySelector('.char-counter');
    const MAX_CHARS = 220;
    
    // Fonction pour mettre à jour le compteur
    function updateCounter() {
        // Obtenir la longueur actuelle du texte
        const length = textarea.value.length;
        
        // Mettre à jour le texte du compteur
        counter.textContent = length;
        
        // Définir les classes en fonction du nombre de caractères
        if (length >= MAX_CHARS) {
            charCounter.className = 'char-counter limit-reached';
        } else if (length >= MAX_CHARS * 0.8) {
            charCounter.className = 'char-counter limit-near';
        } else {
            charCounter.className = 'char-counter';
        }
    }
    
    // Appliquer les écouteurs d'événements
    ['input', 'keyup', 'keydown', 'change', 'paste', 'focus', 'blur'].forEach(event => {
        textarea.addEventListener(event, updateCounter);
    });
    
    // Mettre à jour le compteur au chargement initial
    updateCounter();
    
    // Gérer les collages spéciaux
    textarea.addEventListener('paste', () => {
        setTimeout(updateCounter, 10);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le rechargement de la page

        const emailInput = document.getElementById('email');
        const submitButton = form.querySelector('button[type="submit"]');

        const email = emailInput.value;
        const subject = textarea.value;

        if (!email || !subject) {
            responseMessage.textContent = 'Veuillez remplir tous les champs.';
            responseMessage.style.color = 'red';
            return;
        }

        const data = {
            email: email,
            subject: subject
        };

        console.log('Envoi des données au webhook:', data);

        // Désactiver le bouton et afficher un message de chargement
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        responseMessage.textContent = '';
        responseMessage.style.color = 'inherit'; // Reset color

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            // Make.com webhook renvoie 'Accepted' avec un statut 200 en cas de succès
            if (response.ok) {
                const responseBody = await response.text();
                console.log('Réponse reçue du webhook (statut OK):', responseBody);
                if (responseBody.trim().toLowerCase() === 'accepted') {
                     console.log('Webhook a accepté la requête.');
                     responseMessage.textContent = 'Merci ! Votre proposition a été envoyée avec succès.';
                     responseMessage.style.color = 'green';
                     form.reset(); // Vide le formulaire
                     updateCounter(); // Mettre à jour le compteur après réinitialisation
                } else {
                    // Si la réponse n'est pas 'Accepted' mais le statut est OK
                    console.warn('Réponse inattendue du webhook:', responseBody);
                    responseMessage.textContent = 'Votre proposition a été reçue, mais la réponse du serveur est inattendue.';
                     responseMessage.style.color = 'orange';
                }

            } else {
                 console.error('Erreur HTTP reçue:', response.status, response.statusText);
                 throw new Error(`Erreur HTTP : ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur lors de l\'envoi au webhook:', error);
            responseMessage.textContent = 'Une erreur est survenue lors de l\'envoi de votre proposition. Veuillez réessayer.';
            responseMessage.style.color = 'red';
        } finally {
            // Réactiver le bouton dans tous les cas
             submitButton.disabled = false;
             submitButton.innerHTML = '<span>Envoyer la Proposition</span> <i class="fas fa-paper-plane"></i>';
        }
    });
}); 