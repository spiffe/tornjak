import React from 'react';
import PropTypes from 'prop-types';
import { Popper, Typography, Paper, Box } from '@mui/material';

type GridCellExpandProps = {
    width: number,
    value: string
}
const GridCellExpand = React.memo(function GridCellExpand(props: GridCellExpandProps) {
    const { width, value } = props;
    const cellValue = React.useRef<HTMLDivElement>(null);
    const cellDiv = React.useRef(null);
    const wrapper = React.useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [showFullCell, setShowFullCell] = React.useState(false);
    const [showPopper, setShowPopper] = React.useState(false);

    const handleMouseEnter = () => {
        // const isCurrentlyOverflown = isOverflown(cellValue.current);
        if (!cellValue.current) {
            return;
        }
        const isCurrentlyOverflown = cellValue.current.scrollHeight > cellValue.current.clientHeight || cellValue.current.scrollWidth > cellValue.current.clientWidth;
        setShowPopper(isCurrentlyOverflown);
        setAnchorEl(cellDiv.current);
        setShowFullCell(true);
    };

    const handleMouseLeave = () => {
        setShowFullCell(false);
    };

    React.useEffect(() => {
        if (!showFullCell) {
            return undefined;
        }

        function handleKeyDown(nativeEvent: KeyboardEvent) {
            if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
                setShowFullCell(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setShowFullCell, showFullCell]);

    return (
        <Box
            ref={wrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
                alignItems: 'center',
                lineHeight: '24px',
                width: 1,
                height: 1,
                position: 'relative',
                display: 'flex',
              }}
        >
            <Box
                ref={cellDiv}
                sx={{
                    height: 1,
                    width,
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                }}
            />
            <Box
                ref={cellValue}
                sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
                {value}
            </Box>
            {showPopper && (
                <Popper
                    open={showFullCell && anchorEl !== null}
                    anchorEl={anchorEl}
                    style={{ width, marginLeft: -17 }}
                >
                    <Paper
                        elevation={1}
                        style={{ minHeight: wrapper.current!.offsetHeight - 3 }}
                    >
                        <Typography variant="body2" style={{ padding: 8 }}>
                            {value}
                        </Typography>
                    </Paper>
                </Popper>
            )}
        </Box>
    );
});

type renderCellExpandParams = {
    colDef: any,
    value: Date | number | Object | string | boolean
}
export default function renderCellExpand(params: renderCellExpandParams) {
    return (
        <GridCellExpand
            value={params.value ? params.value.toString() : ''}
            width={params.colDef.computedWidth}
        />
    );
}

renderCellExpand.propTypes = {
    colDef: PropTypes.any.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.instanceOf(Date),
        PropTypes.number,
        PropTypes.object,
        PropTypes.string,
        PropTypes.bool,
    ]),
};
