function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
        months--;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months };
}

function getClassFromAge(dob) {
    const { years, months } = calculateAge(dob);

    if (years === 0 && months >= 1) return "Infant Care";
    if (years >= 1 && years < 2) return "Toddler Group";
    if (years >= 2 && years < 3) return "Play Group";
    if (years >= 3 && years < 4) return "Nursery";
    if (years >= 4 && years < 5) return "Junior KG";
    if (years >= 5 && years < 6) return "Senior KG";
    if (years >= 6 && years <= 10) return "After School Care";

    return "Not Eligible";
}

module.exports = getClassFromAge;
