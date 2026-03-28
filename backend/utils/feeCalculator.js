const calculateFee = (child, baseFee, queryYear, queryMonth, paymentDate = null) => {
    const evaluationDate = paymentDate ? new Date(paymentDate) : new Date();
    
    const monthlyFee = child.monthlyFee && child.monthlyFee > 0 ? child.monthlyFee : baseFee;

    // Use child's admissionDate for the day of the month
    const dueDate = new Date(child.admissionDate);
    
    // Set year and month to the current query (queryMonth is 1-12, so -1 for 0-indexed JS dates)
    if (queryYear && queryMonth) {
        dueDate.setFullYear(queryYear);
        dueDate.setMonth(queryMonth - 1);
    } else {
        dueDate.setMonth(evaluationDate.getMonth());
        dueDate.setFullYear(evaluationDate.getFullYear());
    }

    const graceEnd = new Date(dueDate);
    graceEnd.setDate(graceEnd.getDate() + 5);

    let lateFee = 0;

    // Calculate late fee only if evaluation date is past the grace period
    if (evaluationDate > graceEnd) {
        const lateDays = Math.floor((evaluationDate - graceEnd) / (1000 * 60 * 60 * 24));
        lateFee = lateDays > 0 ? lateDays * 10 : 0;
    }

    return {
        dueDate,
        graceEnd,
        baseFee: monthlyFee,
        lateFee,
        totalAmount: monthlyFee + lateFee
    };
};

module.exports = { calculateFee };
