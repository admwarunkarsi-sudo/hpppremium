import { storageAdapter } from '../shared/adapters/localStorageAdapter.js';

export const TestRunner = {
    results: { passed: 0, failed: 0 },
    currentSuite: '',
    
    describe(name, callback) {
        this.currentSuite = name;
        console.log(`\n=== Suite: ${name} ===`);
        callback();
    },

    it(name, callback) {
        try {
            callback();
            this.results.passed++;
            console.log(`[PASS] ${name}`);
        } catch (error) {
            this.results.failed++;
            console.error(`[FAIL] ${name}\n       Reason: ${error.message}`);
        }
    },

    expect(actual) {
        return {
            toEqual: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toBeCloseTo: (expected, precision = 2) => {
                const diff = Math.abs(actual - expected);
                if (diff > Math.pow(10, -precision) / 2) {
                    throw new Error(`Expected ${expected} (precision ${precision}), but got ${actual}`);
                }
            },
            toMatchSnapshot: (snapshotName) => {
                const key = `snapshot_${snapshotName}`;
                const stored = storageAdapter.get(key);
                const actualStr = JSON.stringify(actual);
                if (!stored) {
                    storageAdapter.set(key, actualStr);
                    console.log(`       (Snapshot created for ${snapshotName})`);
                } else {
                    if (stored !== actualStr) {
                        throw new Error(`Snapshot mismatch for ${snapshotName}.\nExpected: ${stored}\nActual: ${actualStr}`);
                    }
                }
            },
            toThrow: () => {
                let threw = false;
                try {
                    actual();
                } catch(e) {
                    threw = true;
                }
                if (!threw) {
                    throw new Error(`Expected function to throw an error, but it didn't.`);
                }
            }
        };
    },

    summary() {
        console.log(`\n--- Test Summary ---`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        if (this.results.failed > 0) {
            console.error("Some tests failed.");
        } else {
            console.log("All tests passed!");
        }
    }
};
