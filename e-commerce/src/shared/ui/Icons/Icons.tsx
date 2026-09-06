export const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 1.66669C6.77504 1.66669 4.16671 4.27502 4.16671 7.50002C4.16671 11.875 10 18.3334 10 18.3334C10 18.3334 15.8334 11.875 15.8334 7.50002C15.8334 4.27502 13.225 1.66669 10 1.66669ZM10 9.58335C8.85004 9.58335 7.91671 8.65002 7.91671 7.50002C7.91671 6.35002 8.85004 5.41669 10 5.41669C11.15 5.41669 12.0834 6.35002 12.0834 7.50002C12.0834 8.65002 11.15 9.58335 10 9.58335Z"
      fill="white"
    />
  </svg>
);

interface IconProps {
  className?: string;
}

export const MenuIcon = ({ className }: IconProps) => (
  <svg
    width="30"
    height="16"
    viewBox="0 0 30 16"
    fill="none"
    className={className}
  >
    <rect width="30" height="2" rx="1" fill="currentColor" />
    <rect y="7" width="20" height="2" rx="1" fill="currentColor" />
    <rect y="14" width="30" height="2" rx="1" fill="currentColor" />
  </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M14.1667 12.5H13.3917L13.1 12.2167C14.1 11.05 14.7083 9.53333 14.7083 7.85417C14.7083 4.09167 11.6167 1 7.85417 1C4.09167 1 1 4.09167 1 7.85417C1 11.6167 4.09167 14.7083 7.85417 14.7083C9.53333 14.7083 11.05 14.1 12.2167 13.1L12.5 13.3917V14.1667L17.7083 19.375L19.375 17.7083L14.1667 12.5ZM7.85417 12.5C5.30833 12.5 3.20833 10.4 3.20833 7.85417C3.20833 5.30833 5.30833 3.20833 7.85417 3.20833C10.4 3.20833 12.5 5.30833 12.5 7.85417C12.5 10.4 10.4 12.5 7.85417 12.5Z"
      fill="currentColor"
    />
  </svg>
);

export const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z"
      fill="white"
    />
    <path
      d="M17.08 14.15C14.29 12.29 9.74 12.29 6.93 14.15C5.66 15 4.96 16.15 4.96 17.38C4.96 18.61 5.66 19.75 6.92 20.59C8.32 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z"
      fill="white"
    />
  </svg>
);

export const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.69C2 5.6 4.49 3.1 7.56 3.1C9.38 3.1 10.99 3.98 12 5.34C13.01 3.98 14.63 3.1 16.44 3.1C19.51 3.1 22 5.6 22 8.69C22 15.69 15.52 19.82 12.62 20.81Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M2 2H3.74001C4.82001 2 5.67 2.93 5.58 4L4.75 13.96C4.61 15.59 5.89999 16.99 7.53999 16.99H18.19C19.63 16.99 20.89 15.81 21 14.38L21.54 6.88C21.66 5.22 20.4 3.87 18.73 3.87H5.82001"
      stroke="white"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.25 22C16.9404 22 17.5 21.4404 17.5 20.75C17.5 20.0596 16.9404 19.5 16.25 19.5C15.5596 19.5 15 20.0596 15 20.75C15 21.4404 15.5596 22 16.25 22Z"
      stroke="white"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.25 22C8.94036 22 9.5 21.4404 9.5 20.75C9.5 20.0596 8.94036 19.5 8.25 19.5C7.55964 19.5 7 20.0596 7 20.75C7 21.4404 7.55964 22 8.25 22Z"
      stroke="white"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 8H21"
      stroke="white"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Chevron Icon - used in dropdowns and accordions
interface ChevronIconProps {
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  color?: string;
}

export const ChevronIcon = ({
  direction = "down",
  className = "",
  color = "currentColor",
}: ChevronIconProps) => {
  const rotations = {
    up: "rotate-180",
    down: "",
    left: "rotate-90",
    right: "-rotate-90",
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={`${rotations[direction]} ${className}`}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Close Icon - used in modals and dialogs
interface CloseIconProps {
  size?: number;
  className?: string;
}

export const CloseIcon = ({ size = 20, className = "" }: CloseIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M15 5L5 15M5 5l10 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Trash Icon - used for delete actions
export const TrashIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path
      d="M10.5 2.98667C8.835 2.82 7.16 2.73333 5.49 2.73333C4.5 2.73333 3.51 2.78333 2.52 2.88333L1.5 2.98667"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.25 2.48L4.36 1.83C4.44 1.355 4.5 1 5.345 1H6.655C7.5 1 7.565 1.375 7.64 1.835L7.75 2.48"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.42498 4.57001L9.09998 9.60501C9.04498 10.39 8.99998 11 7.60498 11H4.39498C2.99998 11 2.95498 10.39 2.89998 9.60501L2.57498 4.57001"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.16 8.25H6.835"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.75 6.25H7.25"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Arrow Icon - used for navigation
interface ArrowIconProps {
  direction?: "up" | "down" | "left" | "right";
  size?: number;
  className?: string;
}

export const ArrowIcon = ({
  direction = "right",
  size = 40,
  className = "",
}: ArrowIconProps) => {
  const rotations = {
    up: "-rotate-90",
    down: "rotate-90",
    left: "rotate-180",
    right: "",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={`${rotations[direction]} ${className}`}
    >
      <path
        d="M20 8L32 20L20 32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Home Icon - used for home/main page
export const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M7.5 15.8333V13.3333C7.5 12.8731 7.8731 12.5 8.33333 12.5H11.6667C12.1269 12.5 12.5 12.8731 12.5 13.3333V15.8333C12.5 16.2936 12.8731 16.6667 13.3333 16.6667H15.8333C16.2936 16.6667 16.6667 16.2936 16.6667 15.8333V9.16667L10 3.33334L3.33333 9.16667V15.8333C3.33333 16.2936 3.70643 16.6667 4.16667 16.6667H6.66667C7.1269 16.6667 7.5 16.2936 7.5 15.8333Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Phone Icon - used for contact information
export const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M18.3083 15.2751C18.3083 15.5751 18.2417 15.8834 18.1 16.1834C17.9583 16.4834 17.775 16.7667 17.5333 17.0334C17.1333 17.4667 16.6917 17.7834 16.1917 18.0001C15.7 18.2167 15.1667 18.3334 14.5917 18.3334C13.7417 18.3334 12.8333 18.1334 11.875 17.7251C10.9167 17.3167 9.95833 16.7667 9.00833 16.0751C8.05 15.3751 7.14167 14.5917 6.275 13.7167C5.41667 12.8334 4.63333 11.9251 3.93333 10.9917C3.24167 10.0584 2.69167 9.10841 2.29167 8.16675C1.89167 7.21675 1.69167 6.30841 1.69167 5.44175C1.69167 4.88341 1.8 4.35008 2.01667 3.86675C2.23333 3.37508 2.575 2.92508 3.05 2.52508C3.61667 2.02508 4.23333 1.77508 4.88333 1.77508C5.11667 1.77508 5.35 1.82508 5.55833 1.92508C5.775 2.02508 5.96667 2.17508 6.11667 2.39175L8.125 5.28341C8.275 5.49175 8.38333 5.68341 8.45833 5.86675C8.53333 6.04175 8.575 6.21675 8.575 6.37508C8.575 6.57508 8.51667 6.77508 8.4 6.96675C8.29167 7.15841 8.13333 7.35841 7.93333 7.55841L7.3 8.21675C7.20833 8.30841 7.16667 8.41675 7.16667 8.55008C7.16667 8.61675 7.175 8.67508 7.19167 8.74175C7.21667 8.80841 7.24167 8.85841 7.25833 8.90841C7.40833 9.18341 7.66667 9.54175 8.03333 9.97508C8.40833 10.4084 8.80833 10.8501 9.24167 11.2917C9.69167 11.7334 10.125 12.1417 10.5667 12.5167C10.9417 12.8167 11.3 13.1167 11.6667 13.4001C11.7167 13.4334 11.7667 13.4667 11.825 13.5001C11.8833 13.5334 11.9417 13.5667 12 13.5917C12.0583 13.6167 12.1167 13.6417 12.1833 13.6584C12.25 13.6751 12.3167 13.6834 12.3833 13.6834C12.4417 13.6834 12.5 13.6501 12.5583 13.5834L13.2083 12.9417C13.4167 12.7334 13.6167 12.5751 13.8083 12.4751C14 12.3584 14.1917 12.3001 14.4 12.3001C14.5583 12.3001 14.725 12.3334 14.9083 12.4084C15.0917 12.4834 15.2833 12.5917 15.4917 12.7334L18.4167 14.7667C18.6333 14.9167 18.7833 15.0917 18.875 15.3001C18.9583 15.5084 19.0083 15.7167 19.0083 15.9501L18.3083 15.2751Z"
      stroke="#EF6F2E"
      strokeWidth="1.5"
      strokeMiterlimit="10"
    />
  </svg>
);
