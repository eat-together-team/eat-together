import React from 'react';
import NameBubble from './NameBubble'; // Ensure this is the correct path

const BuddyParentComponent = () => {
    
    // Example person object for demonstration
    const examplePerson = {
        firstName: "Eric",
        lastName: "N.",
        image: "../../assets/logo.png",
        hasImage: true
    };

    // Function to handle when the "Accept" button is pressed
    const handleAccept = (person) => {
        alert(`Yay! ${person.firstName} is now your buddy!`); // Show an alert or replace with your own handling logic
    };

    // Function to handle when the "Decline" button is pressed
    const handleDecline = (person) => {
        alert(`You declined ${person.firstName}'s request.`); // Show an alert or replace with your own handling logic
    };

    return (
        <NameBubble
            person={examplePerson}
            click={() => console.log(`${examplePerson.firstName}'s profile clicked`)} 
            onAccept={handleAccept}
            onDecline={handleDecline}
        />
    );
};

export default BuddyParentComponent;
