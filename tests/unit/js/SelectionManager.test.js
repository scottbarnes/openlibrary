import SelectionManager from '../../../openlibrary/plugins/openlibrary/js/ile/utils/SelectionManager/SelectionManager.js';


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

    test('toggleSelected', () => {
        const sm = new SelectionManager(null, '/search');
        sm.ile = { $statusImages: { append: jest.fn() } };
        const el = document.createElement('div');
        el.classList.add('ile-selectable');
        sm.getProvider = jest.fn().mockReturnValue({ data: () => 'OL1W' });
        sm.getType = jest.fn().mockReturnValue({ singular: 'work', image: () => 'image_url' });
        sm.setElementSelectionAttributes = jest.fn();
        sm.addSelectedItem = jest.fn();
        sm.removeSelectedItem = jest.fn();
        sm.updateToolbar = jest.fn();

        // Test selecting an unselected element
        el.classList.remove('ile-selected');
        sm.toggleSelected({ currentTarget: el });
        expect(sm.setElementSelectionAttributes).toHaveBeenCalledWith(el, true);
        expect(sm.addSelectedItem).toHaveBeenCalledWith('OL1W');
        expect(sm.updateToolbar).toHaveBeenCalled();

        // Test selecting a selected element
        el.classList.add('ile-selected');
        sm.toggleSelected({ currentTarget: el });
        expect(sm.setElementSelectionAttributes).toHaveBeenCalledWith(el, false);
        expect(sm.removeSelectedItem).toHaveBeenCalledWith('OL1W');
        expect(sm.updateToolbar).toHaveBeenCalled();
    });
});
