import { useState } from "react";
import GooeyNav from "./GooeyNav";
import { EVENT_TYPES } from "../../config/eventTypes";

const EventFilterNav = ({ onChange }) => {
  // Combinamos "Ver Todos" con tus 15 eventos = 16 botones
  const filterOptions = [
    { key: "ALL", label: "Ver Todos" },
    ...EVENT_TYPES
  ];

  const items = filterOptions.map(e => ({
    label: e.label,
    href: "#"
  }));

  const handleItemClick = (index) => {
    const selected = filterOptions[index];
    const updatedEvents = selected.key === "ALL" ? [] : [selected.key];

    if (typeof onChange === "function") {
      onChange(updatedEvents);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: "1.5rem" }}>
      <GooeyNav
        items={items}
        initialActiveIndex={0}
        onItemClick={handleItemClick} 
      />
    </div>
  );
};

export default EventFilterNav;