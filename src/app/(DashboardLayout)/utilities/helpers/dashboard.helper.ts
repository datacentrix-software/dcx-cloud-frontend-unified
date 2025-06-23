import { IAfgriVMData } from "../../types/dashboard";

const getStatusColorAndDescription = (data: IAfgriVMData) => {
    const { uptime_percentage, up_count, down_count, warning_count, paused_count, total_sensors } = data;

    if (uptime_percentage < 95) {
        return { description: "Low Uptime", color: "red" };
    } if (down_count > 0) {
        return { description: "At least one sensor is down", color: "red" };
    } if (warning_count > 0) {
        return { description: "Sensors in Warning", color: "gold" };
    }
    if (paused_count > 0) {
        return { description: "Too Many Sensors Paused", color: "gold" };
    }
    if (up_count < total_sensors && down_count == 0 && !warning_count) {
        return { description: "Partial Coverage", color: "gold" };
    }
    if (up_count === total_sensors && paused_count == 0 && down_count == 0 && warning_count == 0 && uptime_percentage >= 95) {
        return { description: "All Good", color: "#00af64" };
    }
    return { description: "Unknown Status", color: "dimgray" };
};

function createFormattedHeaders(data: Record<string, any>[]): any[] {
    if (!Array.isArray(data) || data.length === 0) return [];

    return Object.keys(data[0]).map((key) =>
        key
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    );
}


function createHeaderConfig(data: Record<string, any>[]): { key: string; label: string }[] {
    if (!Array.isArray(data) || data.length === 0) return [];

    return Object.keys(data[0]).map((key) => ({
        key,
        label: key
            .replace(/_/g, ' ')
            .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    }));
}

function getMonthRange(date: Date): string {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const firstDayString = firstDay.getDate() + ' ' + firstDay.toLocaleString('default', { month: 'long' }) + ' ' + firstDay.getFullYear();
    const lastDayString = lastDay.getDate() + ' ' + lastDay.toLocaleString('default', { month: 'long' }) + ' ' + lastDay.getFullYear();

    return `- Data from ${firstDayString} to ${lastDayString}`;
}

function getDateRangeLabel(arr: Record<string, any>[], dateKey: string): string | null {
    if (!Array.isArray(arr) || arr.length === 0) return null;

    const timestamps: number[] = arr
        .map(item => new Date(item[dateKey]).getTime())
        .filter(time => !isNaN(time));

    if (timestamps.length === 0) return null;

    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    const format = (date: Date) =>
        date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    return ` - Data from ${format(minDate)} to ${format(maxDate)}`;
}


export { getStatusColorAndDescription, createHeaderConfig, createFormattedHeaders, getMonthRange, getDateRangeLabel }