import { useState, useEffect } from 'react';
import modifierApi from '../../services/modifierApi';
import type { ModifierGroupWithOptions, ModifierOption } from '../../services/modifierApi';
import ModifierGroupForm from './ModifierGroupForm';
import ModifierOptionForm from './ModifierOptionForm';

export default function ModifierManager() {
  const [groups, setGroups] = useState<ModifierGroupWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroupWithOptions | null>(null);
  const [addingOptionToGroup, setAddingOptionToGroup] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<{ groupId: string; option: ModifierOption } | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await modifierApi.getModifierGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load modifier groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete this modifier group? This will detach it from all items.')) return;
    
    try {
      await modifierApi.deleteModifierGroup(id);
      await loadGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm('Delete this option?')) return;
    
    try {
      await modifierApi.deleteOption(optionId);
      await loadGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete option');
    }
  };

  const handleFormSuccess = async () => {
    setShowGroupForm(false);
    setEditingGroup(null);
    setAddingOptionToGroup(null);
    setEditingOption(null);
    await loadGroups();
  };

  if (loading) {
    return <div className="p-6 text-center">Loading modifier groups...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
      </div>
    );
  }

  // Show form
  if (showGroupForm || editingGroup) {
    return (
      <div className="p-6">
        <ModifierGroupForm
          group={editingGroup || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowGroupForm(false);
            setEditingGroup(null);
          }}
        />
      </div>
    );
  }

  // Show option form
  if (addingOptionToGroup || editingOption) {
    return (
      <div className="p-6">
        <ModifierOptionForm
          groupId={addingOptionToGroup || editingOption!.groupId}
          option={editingOption?.option}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setAddingOptionToGroup(null);
            setEditingOption(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Modifier Groups</h1>
        <button
          onClick={() => setShowGroupForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Group
        </button>
      </div>

      {!groups || groups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No modifier groups yet. Create one to get started!
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{group.name}</h2>
                  <div className="flex gap-2 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      group.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.status}
                    </span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {group.selectionType === 'single' ? 'Single choice' : 'Multiple choice'}
                    </span>
                    {group.isRequired && (
                      <span className="px-2 py-1 rounded bg-red-100 text-red-800">
                        Required
                      </span>
                    )}
                  </div>
                  {group.selectionType === 'multiple' && (
                    <p className="text-sm text-gray-600 mt-2">
                      Min: {group.minSelections || 0}, Max: {group.maxSelections || 'Unlimited'}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingGroup(group)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Options List */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Options ({group.options?.length || 0})</h3>
                  <button
                    onClick={() => setAddingOptionToGroup(group.id)}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    + Add Option
                  </button>
                </div>

                {!group.options || group.options.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No options yet. {group.isRequired && 'Add at least one option (required).'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {group.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded"
                      >
                        <div>
                          <span className="font-medium">{option.name}</span>
                          <span className="text-gray-600 ml-2">
                            {Number(option.priceAdjustment) > 0 
                              ? `+$${Number(option.priceAdjustment).toFixed(2)}` 
                              : 'No extra charge'}
                          </span>
                          {option.status === 'inactive' && (
                            <span className="ml-2 text-sm text-gray-500">(inactive)</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingOption({ groupId: group.id, option })}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOption(option.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
