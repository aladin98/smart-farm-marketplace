import { useTranslation } from "react-i18next";

function CategoryChips({ categories, selectedCategory, onSelectCategory }) {
  const { t } = useTranslation();

  return (
    <div className="px-4 mt-4">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => {
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-sm border transition ${
                isActive
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              {t(`categoriesMap.${category}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryChips;