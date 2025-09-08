import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScreenSize } from '../hooks/useScreenSize';

export const Input = ({
  label,
  value,
  onChange,
  onBlur,
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
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur(); // <-- only call if provided
          }}
        />
        {list && dataList && (
          <datalist id={list}>
            {dataList.map((item, idx) => (
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

export const SelectWithSearchBar = ({
  label,
  value,
  onChange,
  options = [],
  style = {},
  icon = null,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((opt) => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const styles = {
    container: {
      position: "relative",
      display: "inline-block",
      width: "220px",
      ...style,
    },
    selectBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.inputBackground || "#fff",
      border: `1.5px solid ${theme.borderColor || "#ccc"}`,
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: "1rem",
      color: theme.textPrimary || "#333",
      cursor: "pointer",
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      background: theme.inputBackground || "#fff",
      border: `1px solid ${theme.borderColor || "#ccc"}`,
      borderRadius: 8,
      marginTop: 4,
      maxHeight: 200,
      overflowY: "auto",
      zIndex: 10,
    },
    option: {
      padding: "8px 12px",
      cursor: "pointer",
    },
    searchInput: {
      width: "90%",
      padding: "6px 10px",
      border: "none",
      borderBottom: `1px solid ${theme.borderColor || "#ccc"}`,
      outline: "none",
      fontSize: "1rem",
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
      marginRight: 26,
    },
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div style={styles.container} ref={dropdownRef}>
      <span style={{
        ...styles.floatingLabel,
        ...(value || isFocused
          ? styles.floatingLabelFloating
          : styles.floatingLabelInside),
      }}>{label}</span>

      <div
        style={styles.selectBox}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsFocused(true);
        }}
      >
        {selectedOption ? selectedOption.name : ""}
        {icon && <span>{icon}</span>}
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חפש..."
            style={styles.searchInput}
            autoFocus
          />

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                style={styles.option}
                onClick={() => {
                  onChange({ target: { value: opt.value } });
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#eee")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {opt.name}
              </div>
            ))
          ) : (
            <div style={styles.option}>אין תוצאות</div>
          )}
        </div>
      )}
    </div>
  );
};

export const Table = ({ title, headers, data, sortable = false }) => {
  const { theme } = useTheme();
  const { isMobile, isTablet, isDesktop } = useScreenSize();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return data;

    // Helper to normalize qty/minimum by unit
    const normalize = (value, unit) => {
      if (unit === 'קג') return parseFloat(value) * 1000;
      return parseFloat(value);
    };

    return [...data].sort((a, b) => {
      // For qty and lowThreshold, normalize by unit
      if (['qty', 'lowThreshold'].includes(sortConfig.key)) {
        const aVal = normalize(a[sortConfig.key], a.unit);
        const bVal = normalize(b[sortConfig.key], b.unit);
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // ...existing string/number sorting...
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (!isNaN(aVal) && !isNaN(bVal)) {
        const numA = parseFloat(aVal);
        const numB = parseFloat(bVal);
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return strA.localeCompare(strB, 'he');
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
    if (!sortable || isMobile) return null; // Hide sort icons on mobile

    const iconSize = isTablet ? 14 : 16;

    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? (
        <ChevronUp size={iconSize} />
      ) : (
        <ChevronDown size={iconSize} />
      );
    }
    return <ChevronsUpDown size={iconSize} style={{ opacity: 0.5 }} />;
  };

  const styles = {
    tableWrapper: {
      gridColumn: '1 / -1',
      borderRadius: isMobile ? 8 : 12,
      boxShadow: isMobile
        ? '0 2px 8px rgba(0,0,0,0.08)'
        : theme.boxShadow || '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: theme.surface || '#fafafa',
      maxHeight: isMobile ? 'calc(100vh - 300px)' : isTablet ? 350 : 400,
      overflowY: 'auto',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      // Mobile-specific improvements
      ...(isMobile && {
        fontSize: '14px',
        marginTop: '10px',
      })
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: isMobile ? '0.85rem' : isTablet ? '0.95rem' : '1rem',
      color: theme.textPrimary || '#333',
      userSelect: 'none',
      minWidth: isMobile ? '100%' : isTablet ? 500 : 600,
    },
    th: {
      position: 'sticky',
      top: 0,
      zIndex: 2,
      borderBottom: `2px solid ${theme.borderColor || '#ccc'}`,
      padding: isMobile ? '10px 6px' : isTablet ? '12px 8px' : '14px 12px',
      backgroundColor: theme.tableHeaderBackground || '#f0f0f0',
      fontWeight: '700',
      textAlign: 'center',
      color: theme.colors?.textLight || '#4caf50',
      whiteSpace: isMobile ? 'normal' : 'nowrap',
      fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1rem',
      lineHeight: isMobile ? '1.2' : '1.4',
      // Allow text wrapping on mobile for long headers
      wordWrap: isMobile ? 'break-word' : 'normal',
      maxWidth: isMobile ? '80px' : 'none',
    },
    thSortable: {
      cursor: !isMobile ? 'pointer' : 'default', // Remove pointer cursor on mobile
      transition: 'background-color 0.2s',
      '&:hover': !isMobile ? {
        backgroundColor: theme.tableHeaderHover || '#e8e8e8',
      } : {}
    },
    thContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '2px' : '4px',
      flexDirection: isMobile ? 'column' : 'row',
      // Stack icon below text on mobile if space is tight
      ...(isMobile && {
        minHeight: '32px',
      })
    },
    td: {
      borderBottom: `1px solid ${theme.borderColor || '#ddd'}`,
      padding: isMobile ? '8px 4px' : isTablet ? '10px 6px' : '12px 10px',
      textAlign: 'center',
      verticalAlign: 'middle',
      whiteSpace: isMobile ? 'normal' : 'nowrap',
      fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1rem',
      lineHeight: isMobile ? '1.2' : '1.4',
      maxWidth: isMobile ? '100px' : 'none',
      wordWrap: isMobile ? 'break-word' : 'normal',
      // Better spacing for touch targets on mobile
      ...(isMobile && {
        minHeight: '36px',
      })
    },
    // Title styling
    tableTitle: {
      padding: isMobile ? '8px 12px' : '12px 16px',
      backgroundColor: theme.colors?.primaryGradient || '#4caf50',
      color: theme.colors?.textLight || '#fff',
      fontWeight: '600',
      fontSize: isMobile ? '0.9rem' : '1rem',
      textAlign: 'center',
      borderRadius: `${isMobile ? 8 : 12}px ${isMobile ? 8 : 12}px 0 0`,
      margin: 0,
      position: 'sticky',
      top: 0,
      zIndex: 3,
    },
    // Empty state
    emptyState: {
      padding: isMobile ? '20px' : '40px',
      textAlign: 'center',
      color: theme.textSecondary || '#666',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontStyle: 'italic',
    },
    // Mobile-specific row styling
    mobileRow: {
      borderBottom: `2px solid ${theme.borderColor || '#ddd'}`,
      '&:last-child': {
        borderBottom: 'none'
      }
    }
  };

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div style={styles.tableWrapper}>
        {title && <div style={styles.tableTitle}>{title}</div>}
        <div style={styles.emptyState}>
          אין נתונים להצגה
        </div>
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table} aria-label={title}>
        <thead>
          <tr>
            {headers.map((header, index) => {
              const key = typeof header === 'string' ? header : header.key;
              const label = typeof header === 'string' ? header : (header.label ?? header.key);
              const isSortable = sortable && (header.sortable !== false) && !isMobile; // Disable sorting on mobile

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
                    <span>{label}</span>
                    {getSortIcon(key, isSortable)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={isMobile ? styles.mobileRow : {}}
            >
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
