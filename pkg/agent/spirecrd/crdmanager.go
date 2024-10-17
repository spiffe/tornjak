package spirecrd

// CRDManager defines the interface for managing CRDs
type CRDManager interface {
	// TODO add List/Create/Update/Delete functions for Federation CRD
}

type SPIRECRDManager struct {
	className string
}

// NewSPIRECRDManager initializes new SPIRECRDManager
func NewSPIRECRDManager(className string) (*SPIRECRDManager, error) {
	return &SPIRECRDManager{
		className: className,
	}, nil
}
