import { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    minPrice?: string | null; 
    maxPrice?: string | null;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
}

export const formatAsCurrency = (value: string) => { // takes a raw string (what the user typed) and converts it to a formatted currency string, while ensuring only valid numeric input is considered
    const numericValue = value.replace(/[^0-9.]/g, ""); // means "find everything that is NOT a digit (0-9) or a dot"

    const parts = numericValue.split("."); // split the numeric value into integer and decimal parts "123.4567" → ["123", "4567"].
    const formattedValue = 
        parts[0] + (parts.length > 1 ? "." + parts[1]?.slice(0, 2) : ""); // reassemble the number, but only keep the first two digits of the decimal part (if it exists) "123.4567" → "123.45"

    if(!formattedValue) return ""; // if the formatted value is empty (e.g., user typed only non-numeric characters), return an empty string

    const numberValue = parseFloat(formattedValue); // formattedValue = "abc" → parseFloat("abc") = NaN → return ""
    if(isNaN(numberValue)) return "";

    return new Intl.NumberFormat("en-US", { // American number format (comma thousands separator)
        style: "currency", // prefix with currency symbol (e.g., "$")
        currency: "USD", // use US Dollar ("$")
        minimumFractionDigits: 0, // don't force ".00" if no cents ($100 not $100.00)
        maximumFractionDigits: 2, // max 2 decimal places ($10.50 not $10.5012)
    }).format(numberValue);
};

export const PriceFilter = ({
    minPrice,
    maxPrice,
    onMinPriceChange,
    onMaxPriceChange,
}: Props) => {
    const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => { // cleans what gets STORED (in URL)
        // get the raw input value and extract only numeric values
        const numericValue = e.target.value.replace(/[^0-9.]/g, "");
        onMinPriceChange(numericValue);
    };

    const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => { // cleans what gets STORED (in URL)
        // get the raw input value and extract only numeric values
        const numericValue = e.target.value.replace(/[^0-9.]/g, "");
        onMaxPriceChange(numericValue);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
                <Label className="font-medium text-base">
                    Minimum price
                </Label>
                <Input 
                    type="text" // lets the component control all formatting manually
                    placeholder="$0"
                    value={minPrice ? formatAsCurrency(minPrice) : ""}
                    onChange={handleMinPriceChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label className="font-medium text-base">
                    Maximum price
                </Label>
                <Input 
                    type="text"
                    placeholder="∞"
                    value={maxPrice ? formatAsCurrency(maxPrice) : ""}
                    onChange={handleMaxPriceChange}
                />
            </div>
        </div>
    )
};
