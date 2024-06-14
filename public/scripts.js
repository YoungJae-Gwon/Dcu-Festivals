document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/events') {
        fetch('/api/events')
            .then(response => response.json())
            .then(events => {
                const eventList = document.getElementById('event-list');
                events.forEach(event => {
                    const li = document.createElement('li');
                    li.textContent = `${event.title} - ${event.date}`;
                    li.onclick = () => {
                        localStorage.setItem('eventId', event.id);
                        window.location.href = `/events/${event.id}`;
                    };
                    eventList.appendChild(li);
                });
            });
    }

    if (window.location.pathname.startsWith('/events/')) {
        const eventId = window.location.pathname.split('/').pop();
        fetch(`/api/events/${eventId}`)
            .then(response => response.json())
            .then(event => {
                document.getElementById('event-title').textContent = event.title;
                document.getElementById('event-date').textContent = event.date;
                document.getElementById('event-description').textContent = event.description;
            });
    }
});
