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
  dataList = null,
  rows,
  isSmall = false,
  bgColor = '#f9f9f9'
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block',
      width: '100%',
      maxWidth: "400px",
      ...style,
    },
    inputGroup: {
      display: 'flex',
      alignItems: rows ? 'flex-start' : 'center',
      gap: 6,
      backgroundColor: theme.colors.background,
      border: '1.5px solid #ccc',
      borderRadius: 8,
      padding: rows ? '8px 12px' : isSmall ? '2px 2px 2px 0px' : '8px 12px 8px 0px',
      fontSize: '1rem',
      color: theme.colors.textPrimary,
      transition: 'border-color 0.3s',
    },
    input: {
      flex: 1,
      width: '100%',
      border: 'none',
      outline: 'none',
      fontSize: isSmall ? "0.75rem" : '1rem',
      backgroundColor: 'transparent',
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamily || 'Arial, sans-serif',
      direction: 'rtl',
      resize: 'vertical',
      minHeight: rows ? `${rows * 1.5}em` : 'auto',
    },
    iconWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      color: theme.colors.textPrimary,
      cursor: 'default',
      ...(iconPosition === 'left' ? { marginLeft: 8 } : { marginRight: 8 }),
      pointerEvents: 'none',
    },
    floatingLabel: {
      position: 'absolute',
      backgroundColor: theme.colors.background,
      padding: '0 4px',
      fontWeight: 500,
      color: theme.colors.textPrimary,
      pointerEvents: 'none',
      right: isSmall ? 6 : 12,
      transition: 'all 0.2s ease',
      userSelect: 'none',
    },
    floatingLabelFloating: {
      background: `linear-gradient(to bottom, ${bgColor} 50%, ${theme.colors.background} 50%)`,
      top: rows ? '-0.6em' : '-0.8em',
      fontSize: isSmall ? '0.75rem' : '0.85rem',
      color: theme.colors.textPrimary,
    },
    floatingLabelInside: {
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '1rem',
      color: theme.colors.textMuted,
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

        {rows ? (
          <textarea
            value={value ?? ''}
            onChange={onChange}
            style={styles.input}
            rows={rows}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (onBlur) onBlur();
            }}
          />
        ) : (
          <input
            list={list}
            type={type === 'date' ? (isFocused ? 'date' : 'text') : type}
            value={value ?? ''}
            onChange={onChange}
            style={styles.input}
            min={min}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (onBlur) onBlur();
            }}
          />
        )}

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
    backgroundColor: disabled ? isGood ? theme.colors.textMuted : '#e6a89f' : isGood ? theme.accent.primary : '#c44536',
    color: theme.colors.background,
    border: 'none',
    borderRadius: 10,
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.3s',
    boxShadow: theme.shadows.activeButton,
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
    color: theme.colors.background,
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
  iconPosition = 'left',
  bgColor = '#f9f9f9'
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
      backgroundColor: theme.colors.background,
      border: '1.5px solid #ccc',
      borderRadius: 8,
      padding: '8px 12px 8px 0px',
      fontSize: '1rem',
      color: theme.colors.textPrimary,
      transition: 'border-color 0.3s',
    },
    select: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamily || 'Arial, sans-serif',
      direction: 'rtl',
      cursor: 'pointer',
      width: '100%'
    },
    iconWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      color: theme.colors.textPrimary,
      cursor: 'default',
      ...(iconPosition === 'left' ? { marginLeft: 8 } : { marginRight: 8 }),
      pointerEvents: 'none',
    },
    floatingLabel: {
      position: 'absolute',
      backgroundColor: theme.colors.background,
      padding: '0 4px',
      fontWeight: 500,
      color: theme.colors.textPrimary,
      pointerEvents: 'none',
      right: 12,
      transition: 'all 0.2s ease',
      userSelect: 'none',
    },
    floatingLabelFloating: {
      background: `linear-gradient(to bottom, ${bgColor} 50%, ${theme.colors.background} 50%)`,
      top: '-0.8em',
      fontSize: '0.85rem',
      color: theme.colors.textPrimary,
    },
    floatingLabelInside: {
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '1rem',
      color: theme.colors.textMuted,
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
            <option key={idx} value={opt?.value ?? opt}>
              {opt?.name ?? opt}
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
  bgColor = '#f9f9f9'
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((opt) => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
      position: 'relative',
      display: 'inline-block',
      ...style,
    },
    selectBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 6,
      backgroundColor: theme.colors.background,
      border: '1.5px solid #ccc',
      borderRadius: 8,
      padding: !!value ? "5px 12px" : "9px 12px",
      fontSize: "1rem",
      color: theme.colors.textPrimary,
      cursor: "pointer",
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      border: '1px solid #ccc',
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
      borderBottom: '1px solid #ccc',
      outline: "none",
      fontSize: "1rem",
      background: bgColor
    },
    floatingLabel: {
      position: 'absolute',
      backgroundColor: theme.colors.background,
      padding: '0 4px',
      fontWeight: 500,
      color: theme.colors.textPrimary,
      pointerEvents: 'none',
      right: 12,
      transition: 'all 0.2s ease',
      userSelect: 'none',
    },
    floatingLabelFloating: {
      background: `linear-gradient(to bottom, ${bgColor} 50%, ${theme.colors.background} 50%)`,
      top: '-0.8em',
      fontSize: '0.85rem',
      color: theme.colors.textPrimary,
    },
    floatingLabelInside: {
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '1rem',
      color: theme.colors.textMuted,
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
        {icon && <>{icon}</>}
        {selectedOption ? selectedOption.name : ""}
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
  const { isMobile, isTablet } = useScreenSize();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return data;

    const normalize = (value, unit) => {
      if (unit === 'קג') return parseFloat(value) * 1000;
      return parseFloat(value);
    };

    return [...data].sort((a, b) => {
      if (['qty', 'lowThreshold'].includes(sortConfig.key)) {
        const aVal = normalize(a[sortConfig.key], a.unit);
        const bVal = normalize(b[sortConfig.key], b.unit);
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

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
          return { key: null, direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key, sortable) => {
    if (!sortable || isMobile) return null;

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
      backgroundColor: '#fafafa',
      maxHeight: isMobile ? 'calc(100vh - 300px)' : isTablet ? 350 : 400,
      overflowY: 'auto',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      ...(isMobile && {
        fontSize: '14px',
        marginTop: '10px',
      })
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: isMobile ? '0.85rem' : isTablet ? '0.95rem' : '1rem',
      color: theme.colors.textPrimary,
      userSelect: 'none',
      minWidth: isMobile ? '100%' : isTablet ? 500 : 600,
    },
    th: {
      position: 'sticky',
      top: 0,
      zIndex: 2,
      borderBottom: '2px solid #ccc',
      padding: isMobile ? '10px 6px' : isTablet ? '12px 8px' : '14px 12px',
      backgroundColor: '#f0f0f0',
      fontWeight: '700',
      textAlign: 'right',
      color: theme.colors.textDark,
      whiteSpace: isMobile ? 'normal' : 'nowrap',
      fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1rem',
      lineHeight: isMobile ? '1.2' : '1.4',
      wordWrap: isMobile ? 'break-word' : 'normal',
      maxWidth: isMobile ? '80px' : 'none',
    },
    thSortable: {
      cursor: !isMobile ? 'pointer' : 'default',
      transition: 'background-color 0.2s',
      '&:hover': !isMobile ? {
        backgroundColor: '#e8e8e8',
      } : {}
    },
    thContent: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: isMobile ? '2px' : '4px',
      flexDirection: isMobile ? 'column' : 'row',
      ...(isMobile && {
        minHeight: '32px',
      })
    },
    td: {
      borderBottom: '1px solid #ddd',
      padding: isMobile ? '8px 4px' : isTablet ? '10px 6px' : '12px 10px',
      textAlign: 'right',
      verticalAlign: 'middle',
      whiteSpace: isMobile ? 'normal' : 'nowrap',
      fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1rem',
      lineHeight: isMobile ? '1.2' : '1.4',
      maxWidth: isMobile ? '100px' : 'none',
      wordWrap: isMobile ? 'break-word' : 'normal',
      ...(isMobile && {
        minHeight: '36px',
      })
    },
    tableTitle: {
      padding: isMobile ? '8px 12px' : '12px 16px',
      backgroundColor: theme.colors.primaryGradient,
      color: theme.colors.textDark,
      fontWeight: '600',
      fontSize: isMobile ? '0.9rem' : '1rem',
      textAlign: 'center',
      borderRadius: `${isMobile ? 8 : 12}px ${isMobile ? 8 : 12}px 0 0`,
      margin: 0,
      position: 'sticky',
      top: 0,
      zIndex: 3,
    },
    emptyState: {
      padding: isMobile ? '20px' : '40px',
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontStyle: 'italic',
    },
    mobileRow: {
      borderBottom: '2px solid #ddd',
      '&:last-child': {
        borderBottom: 'none'
      }
    }
  };

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
              const isSortable = sortable && (header.sortable !== false) && !isMobile;

              return (
                <th
                  key={index}
                  style={{
                    ...styles.th,
                    ...(isSortable ? styles.thSortable : {}),
                    ...(isSortable && sortConfig.key === key ? {
                      backgroundColor: '#e0e0e0'
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

export const Modal = ({ title, handleClose, modalStyles, children }) => {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();
  const styles = {
    modalBackdrop: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: isMobile ? 'flex-start' : 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease',
      padding: isMobile ? '10px' : '20px',
      overflowY: isMobile ? 'auto' : 'hidden',
      paddingTop: isMobile ? '20px' : '20px',
      paddingBottom: isMobile ? '20px' : '20px',
    },
    modal: {
      background: theme.colors.background,
      borderRadius: '12px',
      boxShadow: theme.shadows.navbar,
      maxWidth: isMobile ? '100%' : isTablet ? '600px' : '700px',
      width: '100%',
      maxHeight: isMobile ? 'calc(90vh - 40px)' : '85%',
      minHeight: isMobile ? 'auto' : 'auto',
      overflowY: 'auto',
      padding: isMobile ? '16px' : isTablet ? '18px 20px' : '20px 24px',
      animation: 'slideUp 0.3s ease',
      marginTop: isMobile ? '10px' : '0',
      position: 'relative',
      WebkitOverflowScrolling: 'touch',
      ...(modalStyles || {})
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottom: `2px solid ${theme.colors.textDark}33`,
      paddingBottom: 10,
    },
    modalTitle: {
      margin: 0,
      fontSize: isMobile ? '1.2rem' : '1.4rem',
      wordBreak: 'break-word',
      flex: isMobile ? '1 1 100%' : 'none',
      marginBottom: isMobile ? '8px' : '0',
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      fontSize: isMobile ? '1.3rem' : '1.5rem',
      cursor: 'pointer',
      color: theme.colors.textPrimary,
      padding: isMobile ? '5px' : '0',
      minWidth: isMobile ? '30px' : 'auto',
      minHeight: isMobile ? '30px' : 'auto',
    }
  };

  return (
    <div style={styles.modalBackdrop} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button
            onClick={handleClose}
            style={styles.closeButton}
            title="סגור"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
};

export const CircularLoader = () => {
  const { theme } = useTheme();

  const styles = {
    circularLoader: {
      display: "inline-block",
      width: "40px",
      height: "40px",
      border: "3px solid #ddd",
      borderTop: `3px solid ${theme.colors.textPrimary}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    },
  };

  return (
    <div style={styles.circularLoader}></div>
  );
};

export const Header = ({ title, icon }) => {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useScreenSize();

  const style = {
    textAlign: 'center',
    width: isMobile ? '90%' : isTablet ? '70%' : '50%',
    margin: isMobile ? '0 auto 16px auto' : '0 auto 20px auto',
    fontSize: isMobile ? 20 : isTablet ? 24 : 26,
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isMobile ? 6 : 8,
    color: theme.colors.textDark,
    background: theme.colors.primaryGradient,
    padding: isMobile ? '12px 16px' : isTablet ? '13px 20px' : '14px 0',
    borderRadius: '25px',
    boxShadow: theme.shadows.activeButton,
    userSelect: 'none',
    minWidth: isMobile ? '280px' : 'auto',
    maxWidth: isMobile ? '100%' : 'none',
  }

  return (
    <header style={style}>
      {icon}
      {title}
    </header>
  );
};

export const LinearLoader = () => {
  const { theme } = useTheme();
  const styles = {
    linearLoader: {
      position: 'relative',
      height: '4px',
      width: '100%',
      background: 'transparent',
      overflow: 'hidden',
      borderRadius: '2px'
    },
    bar: {
      position: 'absolute',
      height: '100%',
      width: '30%',
      background: theme.colors.textPrimary,
      animation: 'slide 1.5s infinite'
    }
  };

  return (
    <div style={styles.linearLoader}>
      <div style={styles.bar} />
    </div>
  )
};

export const Container = ({ children }) => {
  const { isMobile, isTablet } = useScreenSize();
  const { theme } = useTheme();

  const style = {
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    margin: 'auto',
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    maxWidth: isMobile ? '95dvw' : isTablet ? '85dvw' : '70dvw',
    minWidth: isMobile ? '320px' : 'auto',
    backgroundColor: theme.colors.background,
    color: theme.colors.textPrimary,
    boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : isTablet ? '0 3px 10px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: isMobile ? 8 : isTablet ? 10 : 12,
    overflow: 'hidden',
    ...(isMobile && {
      position: 'relative',
      marginTop: '8px',
      marginBottom: '8px',
    }),
    ...(isTablet && {
      marginTop: '12px',
      marginBottom: '12px',
    }),
  }

  return (
    <div style={style}>
      {children}
    </div>
  );
};

export const Accordion = ({ open, onClick = undefined, title, children }) => {
  const { theme } = useTheme();
  const styles = {
    accordionContainer: {
      background: theme.colors.background,
      borderRadius: '16px',
      padding: '16px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: `1px solid ${theme.colors.textPrimary}33`,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      marginBottom: '24px'
    },
    accordionHeader: {
      display: 'flex',
      justifyContent: !!onClick ? 'space-between' : 'center',
      alignItems: 'center',
      fontSize: '20px',
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    accordionBody: {
      marginTop: '12px',
      color: theme.colors.textPrimary,
      fontSize: '16px',
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.accordionContainer}>
      <div style={styles.accordionHeader} onClick={onClick}>
        <span>{title}</span>
        {onClick && (open ? <ChevronUp /> : <ChevronDown />)}
      </div>

      {open && (
        <div style={styles.accordionBody}>
          {children}
        </div>
      )}
    </div>
  )
};
