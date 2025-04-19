function saveStateToFile() {
    const data = {
        topicName,
        topicAnswer,
        topicVerses
    };

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    window.open(url, '_blank');
}
