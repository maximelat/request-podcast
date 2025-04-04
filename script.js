document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('content-form');
    const responseMessage = document.getElementById('response-message');
    const webhookUrl = 'https://hook.eu2.make.com/fijk5sq6bdtf98cmqljh4nij1a722km7';
    
    // Gestion du compteur de caractères
    const subjectInput = document.getElementById('subject');
    const charCount = document.getElementById('char-count');
    const maxLength = subjectInput.getAttribute('maxlength');
    
    // Initialiser le compteur
    function updateCharCount() {
        const currentLength = subjectInput.value.length;
        charCount.textContent = currentLength;
        
        const charCounter = charCount.parentElement;
        
        // Mise à jour des classes en fonction du nombre de caractères
        if (currentLength >= maxLength) {
            charCounter.classList.add('limit-reached');
            charCounter.classList.remove('limit-near');
        } else if (currentLength >= maxLength * 0.8) {
            charCounter.classList.add('limit-near');
            charCounter.classList.remove('limit-reached');
        } else {
            charCounter.classList.remove('limit-near', 'limit-reached');
        }
    }
    
    // Écouter les événements de saisie pour mettre à jour le compteur
    subjectInput.addEventListener('input', updateCharCount);
    
    // Initialiser le compteur au chargement
    updateCharCount();

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le rechargement de la page

        const emailInput = document.getElementById('email');
        const submitButton = form.querySelector('button[type="submit"]');

        const email = emailInput.value;
        const subject = subjectInput.value;

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
        submitButton.textContent = 'Envoi en cours...';
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
            responseMessage.textContent = 'Une erreur est survenue l\'envoi de votre proposition. Veuillez réessayer.';
            responseMessage.style.color = 'red';
        } finally {
            // Réactiver le bouton dans tous les cas
             submitButton.disabled = false;
             submitButton.textContent = 'Envoyer la Proposition';
        }
    });
}); 