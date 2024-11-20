// components/booking/PersonalInfo.tsx
interface PersonalInfoProps {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName: string;
    mobileNumber: string;
  };
  onPersonalInfoChange: (info: {
    firstName: string;
    lastName: string;
    middleName: string;
    mobileNumber: string;
  }) => void;
}

interface FormField {
  id: keyof PersonalInfoProps["personalInfo"];
  label: string;
  value: string;
  required: boolean;
  placeholder: string;
  type?: "text" | "tel";
  icon: JSX.Element;
}

export function PersonalInfo({
  personalInfo,
  onPersonalInfoChange,
}: PersonalInfoProps) {
  const handleInputChange = (
    field: keyof typeof personalInfo,
    value: string
  ) => {
    onPersonalInfoChange({
      ...personalInfo,
      [field]: value,
    });
  };

  const formFields: FormField[] = [
    {
      id: "firstName",
      label: "First Name",
      value: personalInfo.firstName,
      required: true,
      type: "text",
      placeholder: "Enter your first name",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "lastName",
      label: "Last Name",
      value: personalInfo.lastName,
      required: true,
      type: "text",
      placeholder: "Enter your last name",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "middleName",
      label: "Middle Name",
      value: personalInfo.middleName,
      required: false,
      type: "text",
      placeholder: "Enter your middle name (optional)",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "mobileNumber",
      label: "Mobile Number",
      value: personalInfo.mobileNumber,
      required: true,
      type: "tel",
      placeholder: "Enter your mobile number",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Personal Information
          </h3>
          <p className="text-sm text-gray-600">Please enter your details</p>
        </div>
      </div>

      <div className="space-y-4">
        {formFields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {field.icon}
              </div>
              <input
                type={field.type}
                id={field.id}
                value={field.value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                  placeholder:text-gray-400"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex gap-3">
          <div className="text-blue-500">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">Important Note</p>
            <p className="text-sm text-blue-600 mt-1">
              Please ensure that the details you provide match your valid ID.
              This information will be used during check-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
