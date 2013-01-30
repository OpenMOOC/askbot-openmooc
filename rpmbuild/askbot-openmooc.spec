%define name askbot-openmooc
%define version 0.0dev
%define unmangled_version 0.0dev
%define unmangled_version 0.0dev
%define release 1

Summary: Askbot openmooc integration like theme and saml2
Name: %{name}
Version: %{version}
Release: %{release}
Source0: %{name}-%{unmangled_version}.tar.gz
License: Apache Software License
Group: Development/Libraries
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{_prefix}
BuildArch: noarch
Vendor: Rooter <info@rooter.es>
Url: https://github.com/OpenMOOC/askbot-openmooc
Requires: askbot=0.7.44, python-memcached, djangosaml2=0.9.0

%description
Askbot customizations for OpenMOOC

 * OpenMOOC theme
 * Specific Settings
 * SAML2 integration
 * Allow multiple instance

%prep
%setup -n %{name}-%{unmangled_version} -n %{name}-%{unmangled_version}

%build
python setup.py build

%install
python setup.py install --single-version-externally-managed -O1 --root=$RPM_BUILD_ROOT --record=INSTALLED_FILES

%clean
rm -rf $RPM_BUILD_ROOT

%files -f INSTALLED_FILES
%defattr(-,root,root)
