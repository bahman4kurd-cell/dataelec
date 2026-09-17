// کۆنتڕۆڵی تێمەکان
function changeTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const selector = document.getElementById('themeSelector');
    if (selector) selector.value = savedTheme;
});

// کردنەوەی مۆداڵی دەستکاریکردن
function openEditModal(id, title, electionType) {
    const form = document.getElementById('editTermForm');
    form.action = `/edit_term/${id}`;
    
    document.getElementById('edit_title').value = title;
    document.getElementById('edit_election_type').value = electionType;
    
    const editModal = new bootstrap.Modal(document.getElementById('editTermModal'));
    editModal.show();
}

// دڵنیابوونەوە و سڕینەوەی خول
function confirmDelete(id) {
    if (confirm('ئایا دڵنیایت لە سڕینەوەی ئەم خولی هەڵبژاردنە؟')) {
        const form = document.getElementById('deleteTermForm');
        form.action = `/delete_term/${id}`;
        form.submit();
    }
}