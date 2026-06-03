import { useState } from "react";
import CasesSearch from "../casesSearch/CasesSearch";
import CasesItem from "../casesItem/CasesItem";
import { CASES } from "../data/cases";
import "../cases.css";

const CasesContainer = () => {
  const [searchCase, setSearchCase] = useState("");

  const handleSearch = (searchValue) => {
    setSearchCase(searchValue);
  };

const casesMapped = CASES
  .filter((caseItem) => {
    const searchValue = searchCase.toLowerCase();

    return (
      caseItem.caseNumber.toLowerCase().includes(searchValue) ||
      caseItem.title.toLowerCase().includes(searchValue) ||
      caseItem.clientName.toLowerCase().includes(searchValue) ||
      caseItem.lawyerName.toLowerCase().includes(searchValue) ||
      caseItem.type.toLowerCase().includes(searchValue) ||
      caseItem.status.toLowerCase().includes(searchValue)
    );
  })
  .map((caseItem) => {
    return (
      <CasesItem
        key={caseItem.id}
        id={caseItem.id}
        caseNumber={caseItem.caseNumber}
        title={caseItem.title}
        clientName={caseItem.clientName}
        lawyerName={caseItem.lawyerName}
        type={caseItem.type}
        status={caseItem.status}
        startDate={caseItem.startDate}
        lastUpdate={caseItem.lastUpdate}
        description={caseItem.description}
      />
    );
  });

  return (
    <section className="cases-panel">
      <CasesSearch onSearch={handleSearch} />
      {casesMapped.length > 0 ? (
        <div className="cases-list">{casesMapped}</div>
      ) : (
        <p className="cases-empty">No se encontraron expedientes.</p>
      )}
    </section>
  );
};

export default CasesContainer;
