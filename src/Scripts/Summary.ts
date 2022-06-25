import { mhaStrings } from "./mhaStrings";
import { strings } from "./Strings";
import { mhaDates, date } from "./dates";

class SummaryRow {
    constructor(header: string, label: string, onSet?: Function, onGetUrl?: Function) {
        this._value = "";
        this.header = header;
        this.label = label;
        this.url = strings.mapHeaderToURL(header, label);
        this.onSet = onSet;
        this.onGetUrl = onGetUrl;
    };

    private _value: string;
    header: string;
    label: string;
    url: string;
    onSet?: Function;
    onGetUrl?: Function;

    set value(value: string) { this._value = this.onSet ? this.onSet(value) : value; };
    get value(): string { return this._value; };
    get valueUrl(): string { return this.onGetUrl ? this.onGetUrl(this._value) : ""; };
    toString(): string { return this.label + ": " + this.value; };
};

export class Summary {
    private _totalTime: string = "";

    public creationTime(date: string): string {
        if (!date && !this.totalTime) {
            return null;
        }

        const time = [date || ""];

        if (this.totalTime) {
            time.push(" ", mhaStrings.mhaDeliveredStart, " ", this.totalTime, mhaStrings.mhaDeliveredEnd);
        }

        return time.join("");
    }

    private dateRow = new SummaryRow(
        "Date",
        mhaStrings.mhaCreationTime,
        function (value: string): date { return mhaDates.parseDate(value); }
    );

    private archivedRow = new SummaryRow(
        "Archived-At",
        mhaStrings.mhaArchivedAt,
        null,
        function (value: string): string { return strings.mapValueToURL(value); }
    );

    private summaryRows: SummaryRow[] = [
        new SummaryRow("Subject", mhaStrings.mhaSubject),
        new SummaryRow("Message-ID", mhaStrings.mhaMessageId),
        this.archivedRow,
        this.dateRow,
        new SummaryRow("From", mhaStrings.mhaFrom),
        new SummaryRow("Reply-To", mhaStrings.mhaReplyTo),
        new SummaryRow("To", mhaStrings.mhaTo),
        new SummaryRow("CC", mhaStrings.mhaCc)
    ];

    public exists(): boolean {
        for (let i = 0; i < this.rows.length; i++) {
            if (this.rows[i].value) {
                return true;
            }
        }

        return false;
    }

    public add(header) {
        if (!header) {
            return false;
        }

        for (let i = 0; i < this.rows.length; i++) {
            if (this.rows[i].header.toUpperCase() === header.header.toUpperCase()) {
                this.rows[i].value = header.value;
                return true;
            }
        }

        return false;
    }

    public get rows(): SummaryRow[] { return this.summaryRows; };
    public get totalTime(): string { return this._totalTime; };
    public set totalTime(value: string) {
        // TODO: If this is called more than once, that would be bad
        this._totalTime = value;
        this.dateRow.value = this.creationTime(this.dateRow.value);
    };

    public toString(): string {
        if (!this.exists()) return "";
        const ret = ["Summary"];
        this.rows.forEach(function (row) {
            if (row.value) { ret.push(row.toString()); }
        });
        return ret.join("\n");
    }
}