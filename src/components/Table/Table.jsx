import { useState, useEffect } from "react";
import "../../assets/css/Switch.css";
import "../../assets/css/ResponsiveTable.css";
import "../../assets/js/fontawesome.js";

// FORM COMPONENTS
import { Button } from "../Form/Button.jsx";
import { Switch } from "../Form/Switch";

import { getPermissions } from "../../api/permissions.api";

function TableRow({
  row,
  headers,
  status,
  edit,
  showDelete,
  onStatusClick,
  onEditClick,
  onDeleteClick,
  detail,
  onDetail,
  count,
  currentUser,
}) {
  const [statusSlider, setStatus] = useState(row.status);
  const [permisos, setPermisos] = useState([]);


  const mostrarPermisos = async (id) => {
    const permisos = await getPermissions(id);
    setPermisos(permisos);
  };

  const handleSwitchChange = async () => {
    onStatusClick(row.id, statusSlider);
  };

  useEffect(() => {
    mostrarPermisos(row.id);
  }, [row.id]);

  // Condicional para saber si es el rol de Administrador o Cliente
  const isAdministradorOrCliente =
    row.name === "Administrador" || row.name === "Cliente";

  return (
    <tr key={row.id}>
      {headers.map((header) => (
        <td key={header}>
          {header === "#" ? (
            <span>{count}</span>
          ) : header === "permissions" ? (
            <span>{permisos.join(" - ")}</span>
          ) : (
            row[header]
          )}
        </td>
      ))}
      {status && (
        <td>
          <Switch
            change={handleSwitchChange}
            checked={statusSlider}
            disabled={isAdministradorOrCliente || currentUser === row.username}
          />
        </td>
      )}
      {edit && (
        <td>
          <Button
            colorHTML="#FFC436"
            type="button "
            text={
              <span className="icon has-text-white">
                <i className="fa-solid fa-pencil"></i>
              </span>
            }
            action={() => {
              row.indexer != undefined
                ? onEditClick(row, row.indexer)
                : onEditClick(row.id);
            }}
            disabled={isAdministradorOrCliente || currentUser === row.username}

          />
        </td>
      )}
      {showDelete && (
        <td>
          <Button
            color="primary"
            type="button"
            text={
              <span className="icon">
                <i className="fa-solid fa-trash"></i>
              </span>
            }
            action={() => {
              row.indexer != undefined
                ? onDeleteClick(row.indexer)
                : onDeleteClick(row.id);
            }}
            disabled={isAdministradorOrCliente || currentUser === row.username}
          />
        </td>
      )}
      {detail && (
        <td>
          <Button
            color="info"
            type="button"
            text={
              <span className="icon">
                <i class="fa-solid fa-info"></i>              </span>
            }
            action={() => {
                 onDetail(row.id);
            }}
            disabled={isAdministradorOrCliente || currentUser === row.username}
          />
        </td>
      )}
    </tr>
  );
}

export function Table(props) {
  const {
    headers,
    columns,
    data,
    edit,
    delete: showDelete,
    status,
    onStatusClick,
    onEditClick,
    onDeleteClick,
    itemsPorPage,
    detail,
    onDetail
  } = props;

  const [count, setCount] = useState(1);

  const [username, setUsername] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const offset = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(offset, offset + itemsPerPage);

  const pageCount = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setCurrentPage(1); // Restablecer la página actual al cambiar los elementos por página
    setItemsPerPage(parseInt(newItemsPerPage, 10));
  };

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
  })

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table className="table is-fullwidth">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
              {status && <th>Estado</th>}
              {edit && <th>Editar</th>}
              {showDelete && <th>Eliminar</th>}
              {detail && <th>Detalle</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <TableRow
                key={row.id}
                row={row}
                headers={headers}
                status={status}
                edit={edit}
                showDelete={showDelete}
                onStatusClick={onStatusClick}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onDetail={onDetail}
                detail={detail}
                count={count + index + offset}
                currentUser={username}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginador */}
      <div className="container mt-5">
        <div className="columns is-vcentered">
          <div className="column is-full">
            <ul className="pagination-list" style={{ justifyContent: "center" }}>
              {Array.from({ length: pageCount }, (_, index) => {
                const page = index + 1;

                const shouldShowPage =
                  pageCount <= 7 ||
                  (page <= 3 || page >= pageCount - 2) ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!shouldShowPage) {
                  return null;
                }

                return (
                  <li key={page}>
                    <a
                      className={`pagination-link${currentPage === page ? " is-current" : ""
                        }`}
                      aria-label={`Ir a la página ${page}`}
                      onClick={() => handlePageChange(page)}
                    >
                      <b>{page}</b>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="column is-justify-content-flex-end is-flex is-align-items-center">
            <label htmlFor="itemsPerPage" className="">Mostrar:</label>
            <div className="select is-small ml-3">
              <select
                id="itemsPerPage"
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                value={itemsPerPage}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                {/* Agrega más opciones según tus necesidades */}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
