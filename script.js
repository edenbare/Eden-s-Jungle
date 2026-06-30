// ============================================================
//  Eden Barel's Jungle — script.js
//  All variables, functions, and event listeners live here.
// ============================================================


// -----------------------------------------------
// ANIMAL DATA — array of objects
// Each object holds all info needed to build one card.
// -----------------------------------------------
const animals = [
    { name: "Toucan",    key: "t", image: "images/toucan.jpg",    sound: "sounds/toucan.mp3",    emoji: "🐦" },
    { name: "Jaguar",    key: "j", image: "images/jaguar.jpg",    sound: "sounds/jaguar.mp3",    emoji: "🐆" },
    { name: "Crocodile", key: "c", image: "images/crocodile.jpg", sound: "sounds/crocodile.mp3", emoji: "🐊" },
    { name: "Gorilla",   key: "g", image: "images/gorilla.jpg",   sound: "sounds/gorilla.mp3",   emoji: "🦍" },
    { name: "Peacock",   key: "p", image: "images/peacock.jpg",   sound: "sounds/peacock.mp3",   emoji: "🦚" },
    { name: "Sloth",     key: "s", image: "images/sloth.jpg",     sound: "sounds/sloth.mp3",     emoji: "🦥" },
    { name: "Chameleon", key: "h", image: "images/chameleon.jpg", sound: "sounds/chameleon.mp3", emoji: "🦎" },
    { name: "Macaw",     key: "m", image: "images/macaw.jpg",     sound: "sounds/macaw.mp3",     emoji: "🦜" }
];

// Holds the Audio object that is currently playing so we can stop it before playing a new one
let currentAudio = null;

// Reference to the background music element in the HTML
const bgMusic = document.getElementById("background-music");

// Tracks whether the user has muted the background music
let isMuted = false;


// -----------------------------------------------
// FUNCTION: renderAnimals
// Loops through the animals array and creates a card
// for each one — no repeated HTML needed.
// -----------------------------------------------
function renderAnimals() {
    const grid = document.getElementById("animals-grid");

    for (let i = 0; i < animals.length; i++) {
        const animal = animals[i];

        // Create the card element
        const card = document.createElement("div");
        card.classList.add("animal-card");
        card.id = "card-" + animal.name.toLowerCase(); // e.g. "card-toucan"

        // Build the card's inner HTML
        card.innerHTML =
            '<img src="' + animal.image + '" alt="' + animal.name + '" class="animal-img">' +
            '<div class="card-info">' +
                '<span class="animal-emoji">' + animal.emoji + '</span>' +
                '<h3 class="animal-name">' + animal.name + '</h3>' +
                '<span class="key-badge">Press: ' + animal.key.toUpperCase() + '</span>' +
            '</div>';

        // Attach a click event listener to this card
        card.addEventListener("click", function() {
            playSound(animal);
        });

        grid.appendChild(card);
    }
}


// -----------------------------------------------
// FUNCTION: playSound
// Plays an animal's sound, highlights its card with
// a glowing border + bounce, and updates the banner.
// -----------------------------------------------
function playSound(animal) {
    // Stop any sound that is already playing
    if (currentAudio !== null) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Remove the active highlight from all cards
    const allCards = document.querySelectorAll(".animal-card");
    for (let i = 0; i < allCards.length; i++) {
        allCards[i].classList.remove("active");
    }

    // Create a new Audio object and play it
    currentAudio = new Audio(animal.sound);
    currentAudio.play();

    // Highlight this animal's card (CSS handles the glow + bounce)
    const activeCard = document.getElementById("card-" + animal.name.toLowerCase());
    activeCard.classList.add("active");

    // Update the Now Playing banner
    const banner = document.getElementById("now-playing-text");
    banner.textContent = animal.emoji + "  Now Playing: " + animal.name + "!";

    // When the sound finishes, remove the highlight and reset the banner
    currentAudio.addEventListener("ended", function() {
        activeCard.classList.remove("active");
        banner.textContent = "🎵 Click an animal or press a key to hear it!";
    });
}


// -----------------------------------------------
// EVENT LISTENER: Keyboard
// Listens for key presses across the whole page.
// If the key matches an animal's key, plays its sound.
// -----------------------------------------------
document.addEventListener("keydown", function(event) {
    const pressedKey = event.key.toLowerCase();

    // Check each animal to find a key match
    for (let i = 0; i < animals.length; i++) {
        if (animals[i].key === pressedKey) {
            playSound(animals[i]);
            break; // Stop searching once a match is found
        }
    }
});


// -----------------------------------------------
// EVENT LISTENER: Mute / Unmute Button
// Toggles the background music on and off.
// -----------------------------------------------
document.getElementById("mute-btn").addEventListener("click", function() {
    if (isMuted) {
        bgMusic.play();
        isMuted = false;
        this.textContent = "🔊 Mute Music";
    } else {
        bgMusic.pause();
        isMuted = true;
        this.textContent = "🔇 Unmute Music";
    }
});


// -----------------------------------------------
// SPLASH OVERLAY — Enter button
// When the user clicks "Enter Eden's Jungle", the overlay
// fades out and background music starts immediately.
// This also satisfies the browser's requirement for
// user interaction before audio can play.
// -----------------------------------------------
document.getElementById("enter-btn").addEventListener("click", function() {
    const overlay = document.getElementById("splash-overlay");

    // Fade the overlay out using the CSS transition
    overlay.classList.add("hidden");

    // Start background music now that the user has interacted with the page
    bgMusic.volume = 0.35;
    bgMusic.play();

    // Remove the overlay from the DOM completely after the fade finishes
    overlay.addEventListener("transitionend", function() {
        overlay.style.display = "none";
    }, { once: true }); // { once: true } means this listener removes itself after firing
});


// -----------------------------------------------
// NOT TAUGHT IN CLASS: IntersectionObserver API
//
// What it does:
// IntersectionObserver is a browser API that watches a set
// of elements and fires a callback whenever they enter or
// leave the visible area of the screen (the "viewport").
//
// How we use it here:
// Each animal card starts fully invisible (opacity: 0, shifted
// down — defined in CSS). When the user scrolls and a card
// becomes visible, the observer adds the "visible" class to it,
// which triggers the CSS fade-in and slide-up transition.
// Once a card has faded in, the observer stops watching it
// (observer.unobserve) to avoid wasting browser resources.
//
// The result: a smooth, staggered reveal as cards scroll into view.
// -----------------------------------------------
const cardObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        // If the card has entered the visible area of the screen
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Stop observing — this card has already been revealed
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 }); // Fire when at least 10% of the card is visible


// -----------------------------------------------
// FUNCTION: observeCards
// Registers every animal card with the IntersectionObserver.
// Must run after renderAnimals() so the cards exist in the DOM.
// -----------------------------------------------
function observeCards() {
    const cards = document.querySelectorAll(".animal-card");
    for (let i = 0; i < cards.length; i++) {
        cardObserver.observe(cards[i]);
    }
}


// -----------------------------------------------
// EVENT LISTENER: Page Load
// Runs once everything on the page has finished loading.
// Renders the animal cards then starts observing them.
// Music starts only when the user clicks Enter (see above).
// -----------------------------------------------
window.addEventListener("load", function() {
    renderAnimals();   // Build all 8 animal cards
    observeCards();    // Attach IntersectionObserver to each card
});
