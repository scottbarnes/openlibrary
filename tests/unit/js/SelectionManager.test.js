import SelectionManager from '../../../openlibrary/plugins/openlibrary/js/ile/utils/SelectionManager/SelectionManager.js';

function createTestElementsForToggleSelected() {
    const listItem = document.createElement('li');
    listItem.classList.add('searchResultItem', 'ile-selectable');

    const ctaDiv = document.createElement('div');
    ctaDiv.classList.add('searchResultItemCTA');

    const bookTitle = document.createElement('div');
    bookTitle.classList.add('booktitle');
    const bookLink = document.createElement('a');
    bookLink.href = 'OL12345W'; // Mock href value
    bookTitle.appendChild(bookLink);

    listItem.appendChild(bookTitle);
    listItem.appendChild(ctaDiv);

    return { listItem, ctaDiv };
}

function setupSelectionManager() {
    const sm = new SelectionManager(null, '/search');
    sm.ile = { $statusImages: { append: jest.fn() } };
    sm.selectedItems = { work: [] };
    sm.updateToolbar = jest.fn();
    return sm;
}

describe('SelectionManager', () => {
    afterEach(() => {
        window.sessionStorage.clear();
    });

    test('getSelectedItems initializes selected item types', () => {
        const sm = new SelectionManager(null, '/search');
        sm.getSelectedItems();
        expect(sm.selectedItems).toEqual({
            work: [],
            edition: [],
            author: [],
        });
    });

    test('addSelectedItem', () => {
        const sm = new SelectionManager(null, '/search');
        sm.getSelectedItems(); // to initialize types for push to work
        sm.addSelectedItem('OL1W');
        expect(sm.selectedItems).toEqual({
            work: ['OL1W'],
            edition: [],
            author: [],
        });
    });

    test('toggleSelected - clicking on ctaDiv', () => {
        const sm = setupSelectionManager();
        const { listItem, ctaDiv } = createTestElementsForToggleSelected();

        ctaDiv.addEventListener('click', () => {
            sm.toggleSelected({ target: ctaDiv, currentTarget: listItem });
        });

        expect(listItem.classList.contains('ile-selected')).toBe(false);
        ctaDiv.click();
        expect(listItem.classList.contains('ile-selected')).toBe(false);
        ctaDiv.click();
        expect(listItem.classList.contains('ile-selected')).toBe(false);

        jest.clearAllMocks();
    });

    test('toggleSelected - clicking on listItem', () => {
        const sm = setupSelectionManager();
        const { listItem } = createTestElementsForToggleSelected();

        listItem.addEventListener('click', () => {
            sm.toggleSelected({ target: listItem, currentTarget: listItem });
        });

        expect(listItem.classList.contains('ile-selected')).toBe(false);
        listItem.click();
        expect(listItem.classList.contains('ile-selected')).toBe(true);
        listItem.click();
        expect(listItem.classList.contains('ile-selected')).toBe(false);

        jest.clearAllMocks();
    });
});
