// Loaded automatically by react-scripts before each test file.

// Adds jest-dom's DOM matchers (toBeInTheDocument, toHaveValue, ...).
import "@testing-library/jest-dom"

import { configure } from "@testing-library/react"

// This project marks test hooks with data-test, not RTL's default data-testid.
configure({ testIdAttribute: "data-test" })
