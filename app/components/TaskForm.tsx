"use client";

import { useEffect, useState, useRef } from "react";
import { useTask } from "@/app/context/TaskContext";

function getDefaultDueDateLocalString() {
  const now = new Date();
  now.setHours(23, 59, 0, 0);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function TaskForm() {
  const { createTask } = useTask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>(["medium"]);
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDueDate(getDefaultDueDateLocalString());
    fetchAvailableTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.trim()) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  const addTag = (tagName: string) => {
    const normalizedTag = tagName.trim().toLowerCase();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
      setTagInput("");
      setShowAutocomplete(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.trim();
      if (value) {
        addTag(value);
      }
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Always include priority tags in autocomplete
  const priorityTags = ["low", "medium", "high"];
  const allAvailableTags = [...new Set([...priorityTags, ...availableTags])];
  const filteredTags = allAvailableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(tag)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsLoading(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        tags: tags.length > 0 ? tags : ["medium"],
      });

      // Reset form
      setTitle("");
      setDescription("");
      setDueDate(getDefaultDueDateLocalString());
      setTags(["medium"]);
      setTagInput("");
      await fetchAvailableTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">New Task</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title<span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes or details..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-800"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="relative">
            <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem] p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900 focus:outline-none"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                id="tags"
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => tagInput && setShowAutocomplete(true)}
                placeholder={tags.length === 0 ? "Type hashtags (e.g., #work, #personal)" : ""}
                className="flex-1 min-w-[120px] outline-none text-gray-800 bg-transparent"
                disabled={isLoading}
              />
            </div>
            {showAutocomplete && filteredTags.length > 0 && (
              <div
                ref={autocompleteRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {filteredTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-800 text-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}
