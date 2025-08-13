import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  min,
  style = {},
  icon = null,
  iconPosition = 'left',
  list = null,
  dataList = null
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block',
      ...style,
    },
    inputGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.inputBackground || '#fff',
      border: `1.5px solid ${theme.borderColor || '#ccc'}`,
      borderRadius: 8,
      padding: '8px 12px 8px 0px',
      fontSize: '1rem',
      color: theme.textPrimary || '#333',
      transition: 'border-color 0.3s',
    },
    input: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      color: theme.textPrimary || '#333',
      fontFamily: theme.fontFamily || 'Arial, sans-serif',
      direction: 'rtl',
    },
    iconWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      color: theme.textPrimary || '#333',
      cursor: 'default',
      ...(iconPosition === 'left' ? { marginLeft: 8 } : { marginRight: 8 }),
      pointerEvents: 'none',
    },
    floatingLabel: {
      position: 'absolute',
      backgroundColor: theme.inputBackground || '#fff',
      padding: '0 4px',
      fontWeight: 500,
      color: theme.textPrimary || '#333',
      pointerEvents: 'none',
      right: 12,
      transition: 'all 0.2s ease',
      userSelect: 'none',
    },
    floatingLabelFloating: {
      background: "linear-gradient(to bottom, #f9f9f9 50%, #fff 50%)",
      top: '-0.6em',
      fontSize: '0.85rem',
      color: theme.textPrimary || '#333',
    },
    floatingLabelInside: {
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '1rem',
      color: '#888',
      marginRight: icon && iconPosition === "left" ? 26 : 0
    },
  };

  return (
    <div style={styles.container}>
      <span
        style={{
          ...styles.floatingLabel,
          ...(value || isFocused
            ? styles.floatingLabelFloating
            : styles.floatingLabelInside),
        }}
      >
        {label}
      </span>
      <label style={styles.inputGroup}>
        {icon && iconPosition === 'left' && (
          <div style={styles.iconWrapper}>{icon}</div>
        )}
        <input
          list={list}
          type={type === 'date' ? isFocused ? 'date' : 'text' : type}
          value={value ?? ''}
          onChange={onChange}
          style={styles.input}
          min={min}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {list && dataList && (
          <datalist id={list}>
            {dataList.slice(0, 10).map((item, idx) => (
              <option key={idx} value={item} />
            ))}
          </datalist>
        )}
        {icon && iconPosition === 'right' && (
          <div style={styles.iconWrapper}>{icon}</div>
        )}
      </label>
    </div>
  );
};

export const Button = ({ title, onClick, isGood = true, disabled = false, icon = null, iconPosition = 'left', }) => {
  const { theme } = useTheme();

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 20px',
    backgroundColor: disabled
      ? isGood ? '#d4b896' : '#e6a89f' // Disabled: muted wheat & soft coral
      : isGood ? '#8b6914' : '#c44536', // Active: golden brown & warm brick
    color: theme.buttonText || '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.3s',
    boxShadow: theme.shadows.activeButton, // Golden shadow
    alignSelf: 'flex-start',
    width: 'fit-content'
  };

  const iconWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    color: theme.textPrimary || '#f5f1e8', // Cream white for better contrast
    cursor: 'default',
    ...(iconPosition === 'left' ? { marginLeft: 8 } : { marginRight: 8 }),
    pointerEvents: 'none',
  };

  return (
    <button
      onClick={onClick}
      style={btnStyle}
      title={'הוסף'}
      disabled={disabled}
    >
      {icon && iconPosition === 'left' && (
        <div style={iconWrapperStyle}>{icon}</div>
      )}
      {title}
      {icon && iconPosition === 'right' && (
        <div style={iconWrapperStyle}>{icon}</div>
      )}
    </button>
  )
};

export const Select = ({
  label,
  value,
  onChange,
  options = [],
  style = {},
  icon = null,
  iconPosition = 'left', // 'left' or 'right'
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block',
      ...style,
    },
    selectGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.inputBackground || '#fff',
      border: `1.5px solid ${theme.borderColor || '#ccc'}`,
      borderRadius: 8,
      padding: '8px 12px 8px 0px',
      fontSize: '1rem',
      color: theme.textPrimary || '#333',
      transition: 'border-color 0.3s',
    },
    select: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      color: theme.textPrimary || '#333',
      fontFamily: theme.fontFamily || 'Arial, sans-serif',
      direction: 'rtl',
      cursor: 'pointer',
    },
    iconWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      color: theme.textPrimary || '#333',
      cursor: 'default',
      ...(iconPosition === 'left' ? { marginLeft: 8 } : { marginRight: 8 }),
      pointerEvents: 'none',
    },
    floatingLabel: {
      position: 'absolute',
      backgroundColor: theme.inputBackground || '#fff',
      padding: '0 4px',
      fontWeight: 500,
      color: theme.textPrimary || '#333',
      pointerEvents: 'none',
      right: 12,
      transition: 'all 0.2s ease',
      userSelect: 'none',
    },
    floatingLabelFloating: {
      background: 'linear-gradient(to bottom, #f9f9f9 50%, #fff 50%)',
      top: '-0.6em',
      fontSize: '0.85rem',
      color: theme.textPrimary || '#333',
    },
    floatingLabelInside: {
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '1rem',
      color: '#888',
      marginRight: icon && iconPosition === 'left' ? 26 : 0,
    },
  };

  return (
    <div style={styles.container}>
      <span
        style={{
          ...styles.floatingLabel,
          ...(value || isFocused
            ? styles.floatingLabelFloating
            : styles.floatingLabelInside),
        }}
      >
        {label}
      </span>
      <label style={styles.selectGroup}>
        {icon && iconPosition === 'left' && (
          <div style={styles.iconWrapper}>{icon}</div>
        )}
        <select
          value={value ?? ''}
          onChange={onChange}
          style={styles.select}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <option value="" disabled hidden></option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {icon && iconPosition === 'right' && (
          <div style={styles.iconWrapper}>{icon}</div>
        )}
      </label>
    </div>
  );
};

export const Table = ({ title, headers, data, sortable = false }) => {
  const { theme } = useTheme();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle numbers
      if (!isNaN(aVal) && !isNaN(bVal)) {
        const numA = parseFloat(aVal);
        const numB = parseFloat(bVal);
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // Handle strings
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return strA.localeCompare(strB, 'he'); // Hebrew locale support
      } else {
        return strB.localeCompare(strA, 'he');
      }
    });
  }, [data, sortConfig, sortable]);

  const handleSort = (key, sortable) => {
    if (!sortable) return;

    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prevConfig.direction === 'desc') {
          return { key: null, direction: null }; // Reset to no sort
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key, sortable) => {
    if (!sortable) return null;

    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? (
        <ChevronUp size={16} />
      ) : (
        <ChevronDown size={16} />
      );
    }
    return <ChevronsUpDown size={16} style={{ opacity: 0.5 }} />;
  };

  const styles = {
    tableWrapper: {
      gridColumn: '1 / -1',
      borderRadius: 12,
      boxShadow: theme.boxShadow || '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: theme.surface || '#fafafa',
      maxHeight: 400,
      overflowY: 'auto',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '1rem',
      color: theme.textPrimary || '#333',
      userSelect: 'none',
      minWidth: 600,
    },
    th: {
      position: 'sticky',
      top: 0,
      zIndex: 2,
      borderBottom: `2px solid ${theme.borderColor || '#ccc'}`,
      padding: '14px 12px',
      backgroundColor: theme.tableHeaderBackground || '#f0f0f0',
      fontWeight: '700',
      textAlign: 'center',
      color: theme.colors?.textLight || '#4caf50',
      whiteSpace: 'nowrap',
    },
    thSortable: {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: theme.tableHeaderHover || '#e8e8e8',
      }
    },
    thContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
    },
    td: {
      borderBottom: `1px solid ${theme.borderColor || '#ddd'}`,
      padding: '12px 10px',
      textAlign: 'center',
      verticalAlign: 'middle',
      whiteSpace: 'nowrap',
    },
  };

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table} aria-label={title}>
        <thead>
          <tr>
            {headers.map((header, index) => {
              const key = typeof header === 'string' ? header : header.key;
              const label = typeof header === 'string' ? header : (header.label ?? header.key);
              const isSortable = sortable && (header.sortable !== false); // Allow opt-out per column

              return (
                <th
                  key={index}
                  style={{
                    ...styles.th,
                    ...(isSortable ? styles.thSortable : {}),
                    ...(isSortable && sortConfig.key === key ? {
                      backgroundColor: theme.tableHeaderActive || '#e0e0e0'
                    } : {})
                  }}
                  onClick={() => handleSort(key, isSortable)}
                  title={isSortable ? 'לחץ למיון' : undefined}
                >
                  <div style={styles.thContent}>
                    {label}
                    {getSortIcon(key, isSortable)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => {
                const key = typeof header === 'string' ? header : header.key;
                const content =
                  typeof header === 'object' && header.render
                    ? header.render(row[key], row, rowIndex)
                    : row[key] ?? '';

                return (
                  <td key={colIndex} style={styles.td}>
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
